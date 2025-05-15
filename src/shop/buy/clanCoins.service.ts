import { Injectable } from '@nestjs/common';
import { ClanService } from '../../clan/clan.service';
import { ClanCoinsDto } from './dto/clanCoins.dto';
import { UpdateClanDto } from '../../clan/dto/updateClan.dto';

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
    
    const updateClanDto = new UpdateClanDto();
    updateClanDto._id = body.clan_id;
    updateClanDto.gameCoins = clan.gameCoins + body.amount;

    return await this.clanService.updateOneById(updateClanDto);
  }
}
