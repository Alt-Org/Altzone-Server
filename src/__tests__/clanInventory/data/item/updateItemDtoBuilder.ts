import {UpdateItemDto} from "../../../../clanInventory/item/dto/updateItem.dto";
import {ItemName} from "../../../../clanInventory/item/enum/itemName.enum";
import {Recycling} from "../../../../clanInventory/item/enum/recycling.enum";
import {QualityLevel} from "../../../../clanInventory/item/enum/qualityLevel.enum";

export default class UpdateItemDtoBuilder {
    private readonly base: Partial<UpdateItemDto> = {
        _id: undefined,
        name: undefined,
        weight: undefined,
        recycling: undefined,
        qualityLevel: undefined,
        unityKey: undefined,
        location: undefined,
        price: undefined,
        isFurniture: undefined,
        stock_id: undefined,
        room_id: undefined,
    };

    build(): UpdateItemDto {
        return { ...this.base } as UpdateItemDto;
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
        this.base.stock_id = stockId;
        return this;
    }

    setRoomId(roomId: string) {
        this.base.room_id = roomId;
        return this;
    }
}