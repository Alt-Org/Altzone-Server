import {CreateStockDto} from "../../../../clanInventory/stock/dto/createStock.dto";

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

    setClanId(clanId: string) {
        this.base.clan_id = clanId;
        return this;
    }
}