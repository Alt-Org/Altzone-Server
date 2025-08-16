import { VotingBuilder } from './VotingBuilder';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { BuyClanShopItemVoting } from '../../../../voting/schemas/buyShopItem.schema';
import { VotingType } from '../../../../voting/enum/VotingType.enum';

export class BuyClanShopItemVotingBuilder extends VotingBuilder {
  shopItemName: ItemName;

  setItemName(name: ItemName) {
    this.shopItemName = name;
    return this;
  }

  override build() {
    return {
      ...this.base,
      type: VotingType.SHOP_BUY_ITEM,
      shopItemName: this.shopItemName,
    } as BuyClanShopItemVoting;
  }
}
