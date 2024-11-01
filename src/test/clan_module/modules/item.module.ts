import { ItemService } from "../../../clan_module/item/item.service";
import { ItemHelperService } from "../../../clan_module/item/itemHelper.service";
import { ItemMoverService } from "../../../clan_module/item/itemMover.service";
import CommonModule from "./common";

export default class ItemModule {
    private constructor() {}

    static async getItemService(){
        const module = await CommonModule.getModule();
        return await module.resolve(ItemService);
    }

    static async getItemMoverService(){
        const module = await CommonModule.getModule();
        return await module.resolve(ItemMoverService);
    }

    static async getItemHelperService(){
        const module = await CommonModule.getModule();
        return await module.resolve(ItemHelperService);
    }
}