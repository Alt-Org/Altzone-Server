import { Injectable } from '@nestjs/common';
import { ClanService } from '../../clan/clan.service';

@Injectable()
export class ClanCoinsService {
  public constructor(private readonly clanService: ClanService) {}

  /**
   * Add coins to a specified clan
   *
   * @param clan_id clan _id for which coins should be added
   * @param amount amount of coins to add
   *
   * @return true if succeeded and ServiceError NOT_FOUND if clan is not found
   */
  async addCoins(clan_id: string, amount: number) {
    return this.clanService.basicService.updateOneById(clan_id, {
      $inc: { gameCoins: amount },
    });
  }
}
