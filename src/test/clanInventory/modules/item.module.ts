import mongoose from "mongoose";
import ClanCommonModule from "./clanInventoryCommon";
import { ModelName } from "../../../common/enum/modelName.enum";
import {ItemService} from "../../../clanInventory/item/item.service";
import {ItemSchema} from "../../../clanInventory/item/item.schema";
import {isItemExists} from "../../../clanInventory/item/decorator/validation/IsItemExists.decorator";
import {ItemHelperService} from "../../../clanInventory/item/itemHelper.service";
import {StealTokenGuard} from "../../../clanInventory/item/guards/StealToken.guard";

export default class ItemModule {
    private constructor() {}

    static async getItemService(){
        const module = await ClanCommonModule.getModule();
        return await module.resolve(ItemService);
    }

    static async getIsItemExists(){
        const module = await ClanCommonModule.getModule();
        return await module.resolve(isItemExists);
    }

    static async getItemHelperService(){
        const module = await ClanCommonModule.getModule();
        return await module.resolve(ItemHelperService);
    }

    static async getItemStealTokenGuard(){
        const module = await ClanCommonModule.getModule();
        return await module.resolve(StealTokenGuard);
    }

    static getItemModel(){
        return mongoose.model(ModelName.ITEM, ItemSchema);
    }
}