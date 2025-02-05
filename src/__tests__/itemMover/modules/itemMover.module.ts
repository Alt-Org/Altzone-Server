import ItemMoverCommonModule from "./itemMoverCommon.module";
import {ItemMoverService} from "../../../itemMover/itemMover.service";

export default class ItemMoverModule {
    private constructor() {
    }

    static async getItemMoverService() {
        const module = await ItemMoverCommonModule.getModule();
        return await module.resolve(ItemMoverService);
    }
}