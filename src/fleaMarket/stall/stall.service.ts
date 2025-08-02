import { Injectable } from '@nestjs/common';
import { ClanService } from '../../clan/clan.service';
import { StallResponse } from './payloads/stallResponse';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';

@Injectable()
export class StallService {
  constructor(private readonly clanService: ClanService) {}

  /**
   * Returns the stall by clan id
   */
  async readOneByClanId(
    clanId: string,
  ): Promise<[StallResponse | null, ServiceError[] | null]> {
    const [clan, error] = await this.clanService.readOneById(clanId);

    if (!clan) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            message: 'Failed to retrieve clans with stalls.',
          }),
        ],
      ];
    }

    if (error) {
      return [null, error];
    }

    return [clan.stall as StallResponse, null];
  }

  /**
   * Returns all stalls for all clans
   */
  async readManyStalls(): Promise<
    [StallResponse[] | null, ServiceError[] | null]
  > {
    const [clans, error] = await this.clanService.readAll({
      filter: { stall: { $exists: true } },
    });

    if (!clans || clans.length === 0) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            message: 'Failed to retrieve clans with stalls.',
          }),
        ],
      ];
    }

    if (error) return [null, error];

    return [
      clans
        .filter((clan) => !!clan.stall)
        .map((clan) => clan.stall as StallResponse),
      null,
    ];
  }
}
