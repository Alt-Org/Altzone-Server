import { Injectable } from '@nestjs/common';
import { ClanService } from '../../clan/clan.service';
import { ClanCoinsDto } from './dto/clanCoins.dto';

@Injectable()
export class ClanCoinsService {
  public constructor(
    private readonly clanService: ClanService,
  ) {}
    
  async addCoins(
    body: ClanCoinsDto
  ) {
    return await this.clanService.basicService.updateOneById(body.clan_id, {
      $inc: { gameCoins: body.amount },
    });
  }
}
