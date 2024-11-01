import { CreateItemDto } from "../../../../clan_module/item/dto/createItem.dto";
import { ItemName } from "../../../../clan_module/item/enum/itemName.enum";
import { QualityLevel } from "../../../../clan_module/item/enum/qualityLevel.enum";
import { Recycling } from "../../../../clan_module/item/enum/recycling.enum";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";


export default class CreateItemDtoBuilder implements IDataBuilder<CreateItemDto> {
    private readonly base: CreateItemDto = {
        name: ItemName.SOFA_TAAKKA,
        weight: 30,
        recycling: Recycling.MIXED_WASTE,
        qualityLevel: QualityLevel.rare,
        unityKey: ItemName.SOFA_TAAKKA,
        location: [0, 0],
        price: 150,
        isFurniture: true,
        stock_id: undefined, 
        room_id: undefined
    };

    build() {
        return { ...this.base };
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

    setLocation(location: number[]) {
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

    setStockId(stock_id: string) {
        this.base.stock_id = stock_id;
        return this;
    }

    setRoomId(room_id: string) {
        this.base.room_id = room_id;
        return this;
    }
}