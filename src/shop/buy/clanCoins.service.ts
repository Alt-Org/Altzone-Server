import { Injectable } from '@nestjs/common';
import { ClanService } from '../../clan/clan.service';

@Injectable()
export class ClanCoinsService {
  public constructor(
    private readonly clanService: ClanService,
  ) {}
    
  async addCoins(clan_id: string, amount: number) {
    return await this.clanService.basicService.updateOneById(clan_id, {
      $inc: { gameCoins: amount },
    });
  }
}
