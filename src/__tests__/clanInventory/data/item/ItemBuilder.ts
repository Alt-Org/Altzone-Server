import { Rarity } from '../../../../clanInventory/item/enum/rarity.enum';
import { Recycling } from '../../../../clanInventory/item/enum/recycling.enum';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { Item } from '../../../../clanInventory/item/item.schema';
import { ObjectId } from 'mongodb';
import { Material } from '../../../../clanInventory/item/enum/material.enum';

export default class ItemBuilder {
  private readonly base: Partial<Item> = {
    name: ItemName.ARMCHAIR_RAKKAUS,
    weight: 1,
    recycling: Recycling.GLASS,
    rarity: Rarity.common,
    material: [],
    unityKey: 'defaultUnityKey',
    location: [0, 0],
    price: 10,
    isFurniture: false,
    stock_id: null,
    room_id: null,
  };

  build() {
    return { ...this.base } as Item;
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

  setRarityLevel(rarity: Rarity) {
    this.base.rarity = rarity;
    return this;
  }

  setMaterial(materials: Material[]) {
    this.base.material = materials;
    return this;
  }

  setUnityKey(unityKey: string) {
    this.base.unityKey = unityKey;
    return this;
  }

  setLocation(location: Array<number>) {
    this.base.location = location;
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

  setStockId(stockId: string | ObjectId) {
    this.base.stock_id = stockId as any;
    return this;
  }

  setRoomId(roomId: string | ObjectId) {
    this.base.room_id = roomId as any;
    return this;
  }
}
