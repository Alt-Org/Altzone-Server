import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { FleaMarketItem } from '../../../../fleaMarket/fleaMarketItem.schema';
import { Recycling } from '../../../../clanInventory/item/enum/recycling.enum';
import { Status } from '../../../../fleaMarket/enum/status.enum';
import { Rarity } from '../../../../clanInventory/item/enum/rarity.enum';

export default class FleaMarketItemBuilder {
  private readonly base: Partial<FleaMarketItem> = {
    name: ItemName.CLOSET_RAKKAUS,
    weight: 1,
    recycling: Recycling.ELECTRICAL_EQUIPMENT,
    rarity: Rarity.common,
    unityKey: 'defaultUnityKey',
    status: Status.AVAILABLE,
    price: 10,
    isFurniture: false,
    clan_id: undefined,
  };

  build(): FleaMarketItem {
    return { ...this.base } as FleaMarketItem;
  }

  setName(name: ItemName) {
    this.base.name = name;
    return this;
  }

  setWeight(weight: number) {
    this.base.weight = weight;
    return this;
  }

  setRecycling(recycling: Recycling) {
    this.base.recycling = recycling;
    return this;
  }

  setRarity(rarity: Rarity) {
    this.base.rarity = rarity;
    return this;
  }

  setUnityKey(unityKey: string) {
    this.base.unityKey = unityKey;
    return this;
  }

  setStatus(status: Status) {
    this.base.status = status;
    return this;
  }

  setPrice(price: number) {
    this.base.price = price;
    return this;
  }

  setIsFurniture(isFurniture: boolean) {
    this.base.isFurniture = isFurniture;
    return this;
  }

  setClanId(clanId: string) {
    this.base.clan_id = clanId;
    return this;
  }
}
