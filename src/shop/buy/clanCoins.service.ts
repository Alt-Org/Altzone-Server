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
    const [clan, error] = await this.clanService.readOneById(body.clan_id);
    if (error) return [null, error];
    
    const gameCoins = clan.gameCoins + body.amount;
    const { _id, } = clan;

    return await this.clanService.basicService.updateOneById(_id.toString(), { gameCoins });
  }
}
