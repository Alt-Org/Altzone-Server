import { RoomService } from "../../../clan_module/room/room.service";
import RoomHelperService from "../../../clan_module/room/utils/room.helper.service";
import CommonModule from "./common";

export default class RoomModule {
    private constructor() {}

    static async getRoomService(){
        const module = await CommonModule.getModule();
        return await module.resolve(RoomService);
    }

    static async getRoomHelperService(){
        const module = await CommonModule.getModule();
        return await module.resolve(RoomHelperService);
    }
}