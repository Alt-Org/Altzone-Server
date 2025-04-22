import { Recycling } from '../../../../clanInventory/item/enum/recycling.enum';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { CreateFleaMarketItemDto } from '../../../../fleaMarket/dto/createFleaMarketItem.dto';
import { Status } from '../../../../fleaMarket/enum/status.enum';
import { Rarity } from '../../../../clanInventory/item/enum/rarity.enum';

export default class CreateFleaMarketItemDtoBuilder {
  private readonly base: Partial<CreateFleaMarketItemDto> = {
    name: ItemName.CLOSET_RAKKAUS,
    weight: 1,
    recycling: Recycling.GLASS,
    rarity: Rarity.common,
    unityKey: 'defaultUnityKey',
    status: Status.SHIPPING,
    price: 10,
    isFurniture: false,
    clan_id: undefined,
  };

  build(): CreateFleaMarketItemDto {
    return { ...this.base } as CreateFleaMarketItemDto;
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
