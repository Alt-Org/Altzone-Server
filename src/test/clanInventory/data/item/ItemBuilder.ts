import {QualityLevel} from "../../../../clanInventory/item/enum/qualityLevel.enum";
import {Recycling} from "../../../../clanInventory/item/enum/recycling.enum";
import {ItemName} from "../../../../clanInventory/item/enum/itemName.enum";
import {Item} from "../../../../clanInventory/item/item.schema";

export default class ItemBuilder {
    private readonly base: Partial<Item> = {
        name: ItemName.ARMCHAIR_RAKKAUS,
        weight: 1,
        recycling: Recycling.GLASS,
        qualityLevel: QualityLevel.common,
        unityKey: 'defaultUnityKey',
        location: [0, 0],
        price: 10,
        isFurniture: false,
        stock_id: undefined,
        room_id: undefined
    };

    build() {
        return {...this.base} as Item;
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

    setStockId(stockId: string) {
        this.base.stock_id = stockId as any;
        return this;
    }

    setRoomId(roomId: string) {
        this.base.room_id = roomId as any;
        return this;
    }
}