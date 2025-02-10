import {Stock} from "../../../../clanInventory/stock/stock.schema";
import {ObjectId} from "mongodb";

export default class StockBuilder {
    private readonly base: Partial<Stock> = {
        cellCount: 10,
        clan_id: undefined,
        _id: undefined
    };

    build() {
        return {...this.base} as Stock;
    }

    setCellCount(cellCount: number) {
        this.base.cellCount = cellCount;
        return this;
    }

    setClanId(clanId: string | ObjectId) {
        this.base.clan_id = clanId as any;
        return this;
    }

    setId(_id: string | ObjectId) {
        this.base._id = _id as any;
        return this;
    }
}