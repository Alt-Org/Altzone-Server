import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  itemProperties,
  ItemProperty,
} from '../clanInventory/item/const/itemProperties';
import { Rarity } from '../clanInventory/item/enum/rarity.enum';

@Injectable()
export class ClanShopScheduler {
  constructor() {
    this.currentShopItems = this.getRandomItems();
  }
  /**
   * Array holding the current shop items.
   */
  currentShopItems: ItemProperty[];

  /**
   * Updates the shop items every day at midnight.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async resetShopItems() {
    this.currentShopItems = this.getRandomItems();
  }

  /**
   * Retrieves a randomized selection of items categorized by their quality levels.
   *
   * - Common items: Selects 5 random common items.
   * - Rare items: Selects 3 random rare items.
   * - Epic items: Selects 1 random epic item.
   *
   * The items are shuffled to ensure randomness before selection.
   *
   * @returns An array containing a mix of common, rare, and epic items.
   */
  private getRandomItems(): ItemProperty[] {
    const allItems = Object.values(itemProperties);

    const commonItems = allItems.filter(
      (item) => item.rarity === Rarity.common,
    );
    const rareItems = allItems.filter((item) => item.rarity === Rarity.rare);
    const epicItems = allItems.filter((item) => item.rarity === Rarity.epic);

    const shuffle = (array: ItemProperty[]) =>
      array.sort(() => Math.random() - 0.5);

    const shuffledCommon = shuffle(commonItems);
    const shuffledRare = shuffle(rareItems);
    const shuffledEpic = shuffle(epicItems);

    return [
      ...shuffledCommon.slice(0, 5),
      ...shuffledRare.slice(0, 3),
      ...shuffledEpic.slice(0, 1),
    ];
  }
}
