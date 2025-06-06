import { Injectable } from '@nestjs/common';
import { PlayerService } from '../../player/player.service';
import { PlayerEvent } from '../../rewarder/playerRewarder/enum/PlayerEvent.enum';
import { Message } from '../../player/message.schema';
import ServiceError from '../../common/service/basicService/ServiceError';
import { MongooseError } from 'mongoose';
import { SEReason } from '../../common/service/basicService/SEReason';

@Injectable()
export class PlayerStatisticService {
  public constructor(private readonly playerService: PlayerService) {}

  /**
   * Updates Player's statistics based on specified event happen
   * @param player_id player _id for which the event happen
   * @param playerEvent happen event
   * @returns tuple in form [ isSuccess, errors ]
   */
  async updatePlayerStatistic(
    player_id: string,
    playerEvent: PlayerEvent,
  ): Promise<[boolean, ServiceError[] | MongooseError]> {
    switch (playerEvent) {
      case PlayerEvent.BATTLE_PLAYED:
        return this.playerService.updatePlayerById(player_id, {
          $inc: { 'gameStatistics.playedBattles': 1 },
        });

      case PlayerEvent.BATTLE_WON:
        return this.playerService.updatePlayerById(player_id, {
          $inc: { 'gameStatistics.wonBattles': 1 },
        });

      case PlayerEvent.VOTE_MADE:
        return this.playerService.updatePlayerById(player_id, {
          $inc: { 'gameStatistics.participatedVotings': 1 },
        });

      case PlayerEvent.MESSAGE_SENT:
        return this.trackPlayerMessageCount(player_id);

      default:
        return [
          null,
          [new ServiceError({ message: 'Event is not supported' })],
        ];
    }
  }

  /**
   * Tracks the daily amount of messages sent by a player.
   *
   * Finds the player from db and updates or creates a message for that player.
   *
   * @param player_id - ID of the player whose messages to track.
   * @returns - A promise that resolves in to a tuple where first value is boolean that
   * indicates if the update was successful and the second value is an array of errors.
   */
  private async trackPlayerMessageCount(
    player_id: string,
  ): Promise<[boolean, ServiceError[] | MongooseError]> {
    const today = new Date();

    const playerResp = await this.playerService.readOneById(player_id);

    if (!playerResp || playerResp instanceof MongooseError)
      return [
        false,
        [
          new ServiceError({
            message: 'Player is not found',
            reason: SEReason.NOT_FOUND,
            field: 'player_id',
            value: player_id,
          }),
        ],
      ];

    if (!playerResp.data[playerResp.metaData.dataKey])
      return [
        false,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            message: 'Could not read the player',
          }),
        ],
      ];

    const player = playerResp.data[playerResp.metaData.dataKey];
    const messages: Message[] = player.gameStatistics.messages || [];
    let todaysMessage: Message = messages.find(
      (message) => message.date.toDateString() === today.toDateString(),
    );

    if (todaysMessage) {
      todaysMessage.count += 1;
    } else {
      const newMessage = { date: today, count: 1 } as Message;
      messages.push(newMessage);
      todaysMessage = newMessage;
    }

    player.gameStatistics.messages = messages;
    const updateResp = await this.playerService.updateOneById({
      ...player,
      _id: player_id,
    });
    if (updateResp instanceof MongooseError) return [false, updateResp];

    return [true, null];
  }
}
