import { CreateStockDto } from "../../../../clan_module/stock/dto/createStock.dto";
import IDataBuilder from "../../../test_utils/interface/IDataBuilder";

export default class CreateStockDtoBuilder implements IDataBuilder<CreateStockDto> {
    private readonly base: CreateStockDto = {
        cellCount: 10,
        clan_id: 'defaultClanId'
    };

    build() {
        return { ...this.base };
    }

    setCellCount(cellCount: number) {
        this.base.cellCount = cellCount;
        return this;
    }

    setClanId(clan_id: string) {
        this.base.clan_id = clan_id;
        return this;
    }
}