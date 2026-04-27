import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClanService } from '../../clan/clan.service';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { IServiceReturn } from 'src/common/service/basicService/IService';
import { getStallDefaultValues } from '../../clan/defaultValues/stall';
import { StallResponse } from './dto/stallResponse.dto';
import { Stall } from '../../clan/stall/stall.schema';
import { FleaMarketAdPosterDto } from './dto/adPoster.dto';
import { Model } from 'mongoose';
import { FleaMarketItem } from '../fleaMarketItem.schema';
@Injectable()
export class StallService {
  constructor(
    private readonly clanService: ClanService,
    @InjectModel(FleaMarketItem.name)
    private readonly fleaMarketItemModel: Model<FleaMarketItem>,
  ) {}

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
   * Returns all stalls for all clans and get also furniture items for each stall
   *
   * @returns Array of StallResponse objects containing stall details and furniture items
   *
   */
  async readAll(): Promise<IServiceReturn<StallResponse[]>> {
    const [clans, error] = await this.clanService.readAll({
      filter: { stall: { $ne: null } },
    });

    if (error) {
      return [null, error];
    }

    // get furniture items for each stall and add them to the response
    const stallsWithFurniture: StallResponse[] = [];
    for (const clan of clans) {
      const stall = clan.stall;
      const furnitureItems = await this.fleaMarketItemModel.find({
        clan_id: clan._id,
        isFurniture: true,
      });

      // if clan's stall has no furniture item, return empty list, otherwise return list of furniture item names
      const furnitureItemNames = furnitureItems.length
        ? furnitureItems.map((item) => item.name)
        : [];

      stallsWithFurniture.push({
        adPoster: stall.adPoster,
        maxSlots: stall.maxSlots,
        furnitureItems: furnitureItemNames,
      });
      
    }

    return [stallsWithFurniture, null];
  }

  /**
   * Buy additional stall slot for clan
   *
   * Validates that clan has a stall and enough coins to buy the slot.
   *
   * @param clan_id - Id of the clan.
   * @param amount - Amount of slots to buy
   */
  async buyStallSlot(
    clan_id: string,
    amount: number = 1,
  ): Promise<IServiceReturn<boolean>> {
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
    const { stallSlotPrice } = getStallDefaultValues();
    const totalPrice = stallSlotPrice * amount;
    if (clan.gameCoins < totalPrice) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.LESS_THAN_MIN,
            message: `Not enough clan coins. Current: ${clan.gameCoins} Required: ${stallSlotPrice}`,
            field: 'gameCoins',
            value: clan.gameCoins,
          }),
        ],
      ];
    }
    clan.stall.maxSlots += amount;
    return this.clanService.basicService.updateOneById(clan_id, {
      gameCoins: clan.gameCoins - totalPrice,
      stall: clan.stall,
    });
  }

  /**
   * Update ad poster for the stall
   *
   * @param clan_id - Id of the clan.
   * @param adPosterToUpdate - AddPoster fileds to update
   */
  async updateAdPosterByClanId(
    clan_id: string,
    adPosterToUpdate: FleaMarketAdPosterDto,
  ): Promise<IServiceReturn<boolean>> {
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

    const stall = await this.mapAdPosterDtoToAdPoster(
      clan.stall,
      adPosterToUpdate,
    );

    return this.clanService.basicService.updateOneById(clan_id, {
      stall: stall,
    });
  }

  /**  * Maps AdPosterDto to AdPoster in the Stall schema
   * @param stall - The Stall object to update
   * @param adPosterToUpdate - The AdPosterDto containing the fields to update
   * @returns The updated Stall object
   */
  private async mapAdPosterDtoToAdPoster(
    stall: Stall,
    adPosterToUpdate: FleaMarketAdPosterDto,
  ): Promise<Stall> {
    if (adPosterToUpdate.border) {
      stall.adPoster.border = adPosterToUpdate.border;
    }

    if (adPosterToUpdate.colour) {
      stall.adPoster.colour = adPosterToUpdate.colour;
    }

    if (adPosterToUpdate.mainFurniture) {
      stall.adPoster.mainFurniture = adPosterToUpdate.mainFurniture;
    }

    return stall;
  }
}
