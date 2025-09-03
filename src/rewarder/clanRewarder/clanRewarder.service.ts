import { Injectable } from '@nestjs/common';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { ClanEvent } from './enum/ClanEvent.enum';
import { IServiceReturn } from '../../common/service/basicService/IService';
import { points } from './points';
import BasicService from '../../common/service/basicService/BasicService';
import { InjectModel } from '@nestjs/mongoose';
import { Clan } from '../../clan/clan.schema';
import { Model } from 'mongoose';
import { ClanDto } from '../../clan/dto/clan.dto';
import { PlayerDto } from 'src/player/dto/player.dto';
import { Player } from 'src/player/schemas/player.schema';

/**
 * Handles clan rewarding logic
 */
@Injectable()
export class ClanRewarder {
  //constructor(private readonly clanService: ClanService) {}

  private readonly clanService: BasicService;
  private readonly playerService: BasicService;
  
    constructor(
      @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
      @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    ) {
      this.clanService = new BasicService(clanModel);
      this.playerService = new BasicService(playerModel);
    }

  clanMaxPoints = 10000;

  /**
   * Increases specified clan points and coins amounts.
   *
   * Notice that clan can have 10000 points at max
   *
   * @param clan_id clan _id for which to increase
   * @param points amount of points to add, default 0
   * @param coins amount of coins to add, default 0
   * @throws ServiceError if clan can not be found during the clan data fetching
   *
   * @returns true if the clan was rewarder successfully or ServiceErrors:
   * - NOT_FOUND if the clan can not be found during the update
   */
  async rewardClanForPlayerTask(
    clan_id: string,
    points: number,
    coins: number,
  ) {
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

    if (coins < 0)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.LESS_THAN_MIN,
            field: 'coins',
            value: coins,
            message: 'Coins amount can not be less than 0',
          }),
        ],
      ];

    const [clanToUpdate, errors] = await this.clanService.readOneById(clan_id);

    if (errors) throw errors;

    const { points: clanPoints, gameCoins } = clanToUpdate;
    const newPoints = Math.min(this.clanMaxPoints, clanPoints + points);

    return this.clanService.updateOne(
      {
        points: newPoints,
        gameCoins: gameCoins + coins,
      },
      { filter: { _id: clan_id } },
    );
  }

    /**
     * Rewards specified clan for an event happen
     * @param player_id player _id to reward
     * @param clanEvent happen event
     * @throws MongooseError if any occurred
     * @returns true if clan was rewarded successfully
     */
    async rewardForClanEvent(
      player_id: string,
      clanEvent: ClanEvent,
    ): Promise<IServiceReturn<boolean>> {
      const pointAmount = points[clanEvent];
      if (pointAmount === undefined)
        return [
          null,
          [
            new ServiceError({
              reason: SEReason.WRONG_ENUM,
              field: 'clanEvent',
              value: clanEvent,
              message: 'This clanEvent does not exist',
            }),
          ],
        ];
      const [player, playerErrors] = await this.playerService.readOneById<PlayerDto>(player_id);
      if (playerErrors) return [null, playerErrors];
      if (!player.clan_id) {
        return [
          null,
          [
            new ServiceError({
              reason: SEReason.NOT_FOUND,
              field: 'clan_id',
              value: player.clan_id,
              message: 'Player does not belong to a clan',
            }),
          ],
        ];
      }
      
      return this.updateClanBattlePoints(player.clan_id, pointAmount);
    }
  
    /**
       * Update specified clan battle points amount
       * @param clan_id player _id
       * @param battlePoints amount of battle points to increase
       * @throws MongooseError if any occurred
       * @returns true if clan was rewarded successfully
       */
      private async updateClanBattlePoints(
        clan_id: string,
        battlePoints: number,
      ): Promise<IServiceReturn<boolean>> {
        const [clan, errors] =
          await this.clanService.readOneById<ClanDto>(clan_id);
    
        if (errors) return [null, errors];
    
        battlePoints = Math.max(0, clan.battlePoints + battlePoints);
    
        return await this.clanService.updateOneById(clan_id, {
          $set: { battlePoints },
        });
      }
}
