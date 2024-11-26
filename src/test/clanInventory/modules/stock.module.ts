import mongoose from "mongoose";
import ClanCommonModule from "./clanInventoryCommon";
import {ModelName} from "../../../common/enum/modelName.enum";
import {StockService} from "../../../clanInventory/stock/stock.service";
import {isStockExists} from "../../../clanInventory/stock/decorator/validation/IsStockExists.decorator";
import {StockSchema} from "../../../clanInventory/stock/stock.schema";

export default class StockModule {
    private constructor() {
    }

    static async getStockService() {
        const module = await ClanCommonModule.getModule();
        return await module.resolve(StockService);
    }

    static async getIsStockExists() {
        const module = await ClanCommonModule.getModule();
        return await module.resolve(isStockExists);
    }

    static getStockModel() {
        return mongoose.model(ModelName.STOCK, StockSchema);
    }
}