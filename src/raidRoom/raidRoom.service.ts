import {IRaidRoom} from "./raidRoom";
import Service from "../util/baseAPIClasses/service";
import {ClassName} from "../util/dictionary";
import RaidRoomModel from "./raidRoom.model";

export default class RaidRoomService extends Service<IRaidRoom>{
    constructor(){
        super(RaidRoomModel);
    }
}