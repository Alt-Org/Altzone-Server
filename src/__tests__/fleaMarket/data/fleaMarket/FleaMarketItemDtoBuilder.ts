import { ObjectId } from 'mongodb';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { Recycling } from '../../../../clanInventory/item/enum/recycling.enum';
import { QualityLevel } from '../../../../clanInventory/item/enum/qualityLevel.enum';
import { FleaMarketItemDto } from '../../../../fleaMarket/dto/fleaMarketItem.dto';
import { Status } from '../../../../fleaMarket/enum/status.enum';

export default class FleaMarketItemDtoBuilder {
  private readonly base: Partial<FleaMarketItemDto> = {
    _id: new ObjectId().toString(),
    name: ItemName.CLOSET_RAKKAUS,
    weight: 1,
    recycling: Recycling.GLASS,
    qualityLevel: QualityLevel.common,
    unityKey: 'defaultUnityKey',
    status: Status.AVAILABLE,
    isFurniture: false,
    price: 10,
    clan_id: new ObjectId().toString(),
  };

  build(): FleaMarketItemDto {
    return { ...this.base } as FleaMarketItemDto;
  }

  setId(id: string) {
    this.base._id = id;
    return this;
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

  setQualityLevel(qualityLevel: QualityLevel) {
    this.base.qualityLevel = qualityLevel;
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

  setIsFurniture(isFurniture: boolean) {
    this.base.isFurniture = isFurniture;
    return this;
  }

  setPrice(price: number) {
    this.base.price = price;
    return this;
  }

  setClanId(clanId: string) {
    this.base.clan_id = clanId;
    return this;
  }
}
