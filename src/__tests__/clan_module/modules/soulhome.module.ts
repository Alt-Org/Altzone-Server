import { SoulHomeService } from "../../../clan_module/soulhome/soulhome.service";
import SoulHomeHelperService from "../../../clan_module/soulhome/utils/soulHomeHelper.service";
import CommonModule from "./common";

export default class SoulHomeModule {
    private constructor() {}

    static async getSoulHomeService(){
        const module = await CommonModule.getModule();
        return await module.resolve(SoulHomeService);
    }

    static async getSoulHomeHelperService(){
        const module = await CommonModule.getModule();
        return await module.resolve(SoulHomeHelperService);
    }
}