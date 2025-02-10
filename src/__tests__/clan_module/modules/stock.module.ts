import { StockService } from "../../../clan_module/stock/stock.service";
import CommonModule from "./common";

export default class StockModule {
    private constructor() {}

    static async getStockService(){
        const module = await CommonModule.getModule();
        return await module.resolve(StockService);
    }
}