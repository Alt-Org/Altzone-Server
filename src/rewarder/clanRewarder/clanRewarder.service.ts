import { Injectable } from '@nestjs/common';
import { ClanService } from '../../clan/clan.service';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';

/**
 * Handles clan rewarding logic
 */
@Injectable()
export class ClanRewarder {
  constructor(private readonly clanService: ClanService) {}

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

    return this.addClanPointsAndCoins(clan_id, points, coins);
  }

  /**
   * Increases specified clan points and coins amounts.
   *
   * Notice that clan can have 10000 points at max
   *
   * @param clan_id clan _id for which to increase
   * @param pointsToAdd amount of points to add, default 0
   * @param coinsToAdd amount of coins to add, default 0
   * @throws ServiceError if clan can not be found during the clan data fetching
   *
   * @returns true if the clan was rewarder successfully or ServiceErrors:
   * - NOT_FOUND if the clan can not be found during the update
   */
  private async addClanPointsAndCoins(
    clan_id: string,
    pointsToAdd = 0,
    coinsToAdd = 0,
  ) {
    const [clanToUpdate, errors] = await this.clanService.readOneById(clan_id);

    if (errors) throw errors;

    const { points, gameCoins } = clanToUpdate;
    const newPoints = Math.min(this.clanMaxPoints, points + pointsToAdd);

    return await this.clanService.updateOne(
      {
        points: newPoints,
        gameCoins: gameCoins + coinsToAdd,
      },
      { filter: { _id: clan_id } },
    );
  }
}
