import {IRaidRoom} from "./raidRoom";
import Service from "../util/baseAPIClasses/service";
import {ClassName} from "../util/dictionary";

export default class RaidRoomService extends Service<IRaidRoom>{
    constructor(){
        super(ClassName.RAID_ROOM);
    }
}