import {CreateStockDto} from "../../../../clanInventory/stock/dto/createStock.dto";
import {ObjectId} from "mongodb";

export default class CreateStockDtoBuilder {
    private readonly base: Partial<CreateStockDto> = {
        cellCount: 10,
        clan_id: undefined,
    };

    build() {
        return {...this.base} as CreateStockDto;
    }

    setCellCount(cellCount: number) {
        this.base.cellCount = cellCount;
        return this;
    }

    setClanId(clanId: string | ObjectId) {
        this.base.clan_id = clanId as any;
        return this;
    }
}