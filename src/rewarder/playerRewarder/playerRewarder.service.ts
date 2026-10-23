import { ClientSession, Model } from 'mongoose';
import { points } from './points';
import { PlayerEvent } from './enum/PlayerEvent.enum';
import { Injectable } from '@nestjs/common';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { IServiceReturn } from '../../common/service/basicService/IService';
import { PlayerDto } from '../../player/dto/player.dto';
import BasicService from '../../common/service/basicService/BasicService';
import { Player } from '../../player/schemas/player.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PlayerRewarder {
  private readonly playerService: BasicService;

  constructor(
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
  ) {
    this.playerService = new BasicService(playerModel);
  }

  /**
   * Updates a player's battlePoints for a battle-related event.
   * @param player_id player _id to update
   * @param playerEvent battle event that happened
   * @throws MongooseError if any occurred
   * @returns true if player was rewarded successfully
   */
  async rewardForPlayerEvent(
    player_id: string,
    playerEvent: PlayerEvent,
  ): Promise<IServiceReturn<boolean>> {
    const battlePointAmount = points[playerEvent];
    if (battlePointAmount === undefined)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.WRONG_ENUM,
            field: 'playerEvent',
            value: playerEvent,
            message: 'This playerEvent does not exist',
          }),
        ],
      ];

    return this.updatePlayerBattlePoints(player_id, battlePointAmount);
  }

  /**
   * Rewards specified player with regular points for a completed player task.
   * @param player_id player _id to reward
   * @param points amount of regular points to reward
   * @clientSession session to use for transaction
   * @throws MongooseError if any occurred
   * @returns true if player was rewarded successfully
   */
  async rewardForPlayerTask(
    player_id: string,
    points: number,
    session?: ClientSession,
  ): Promise<IServiceReturn<true>> {
    if (points < 0)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.LESS_THAN_MIN,
            field: 'points',
            value: points,
            message: 'Points amount can not be less than 0',
          }),
        ],
      ];

    return this.increasePlayerPoints(player_id, points, session);
  }

  /**
   * Increases specified player's regular points amount.
   * @param player_id player _id
   * @param points amount of regular points to increase
   * @param session optional client session for transaction
   * @throws MongooseError if any occurred
   * @returns true if player was rewarded successfully
   */
  private async increasePlayerPoints(
    player_id: string,
    points: number,
    session?: ClientSession,
  ): Promise<IServiceReturn<true>> {
    const [_, errors] = await this.playerService.updateOneById(
      player_id,
      { $inc: { points } },
      { session },
    );

    if (errors) return [null, errors];

    return [true, null];
  }

  /**
   * Updates specified player's battlePoints amount.
   * @param player_id player _id
   * @param battlePoints battlePoints delta to apply
   * @throws MongooseError if any occurred
   * @returns true if player was rewarded successfully
   */
  private async updatePlayerBattlePoints(
    player_id: string,
    battlePoints: number,
  ): Promise<IServiceReturn<boolean>> {
    const [player, errors] =
      await this.playerService.readOneById<PlayerDto>(player_id);

    if (errors) return [null, errors];

    battlePoints = Math.max(0, player.battlePoints + battlePoints);

    return await this.playerService.updateOneById(player_id, {
      $set: { battlePoints },
    });
  }
}
