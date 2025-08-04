import { Injectable } from '@nestjs/common';
import { ClanService } from '../../clan/clan.service';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { IServiceReturn } from 'src/common/service/basicService/IService';
import { getStallDefaultValues } from '../../clan/defaultValues/stall';
import { StallResponse } from './dto/stallResponse.dto';

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

  /**
   * Buy additional stall slot for clan
   *
   * Validates that clan has a stall and enough coins to buy the slot.
   */
  async buyStallSlot(clan_id: string): Promise<IServiceReturn<boolean>> {
    const [clan, error] = await this.clanService.readOneById(clan_id);
    if (error) {
      return [null, error];
    }
    if (!clan.stall) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            message: "Clan doesn't have a stall.",
          }),
        ],
      ];
    }
    const stall = clan.stall;
    const { stallSlotPrice } = getStallDefaultValues();
    if (clan.gameCoins < stallSlotPrice) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.VALIDATION,
            message: `Not enough clan coins. Current: ${clan.gameCoins} Required: ${stallSlotPrice}`,
            field: 'gameCoins',
            value: clan.gameCoins,
          }),
        ],
      ];
    }
    stall.maxSlots++;
    return await this.clanService.basicService.updateOneById(clan_id, {
      gameCoins: clan.gameCoins - stallSlotPrice,
      stall,
    });
  }
}
