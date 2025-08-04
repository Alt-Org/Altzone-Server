import { Injectable } from '@nestjs/common';
import { ClanService } from '../../clan/clan.service';
import { StallResponse } from './dto/stallResponse.dto';
import { IServiceReturn } from '../../common/service/basicService/IService';

@Injectable()
export class StallService {
  constructor(private readonly clanService: ClanService) {}

  /**
   * Returns the stall by clan id
   */
  async readOneByClanId(
    clanId: string,
  ): Promise<IServiceReturn<StallResponse>> {
    const [clan, error] = await this.clanService.readOneById(clanId);

    if (error) {
      return [null, error];
    }

    return [clan.stall, null];
  }

  /**
   * Returns all stalls for all clans
   */
  async readAll(): Promise<IServiceReturn<StallResponse[]>> {
    const [clans, error] = await this.clanService.readAll({
      filter: { stall: { $ne: null } },
    });

    if (error) {
      return [null, error];
    }

    return [clans.map((clan) => clan.stall), null];
  }
}
