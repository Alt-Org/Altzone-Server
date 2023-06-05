import {IRaidRoom} from "./raidRoom";
import Service from "../util/baseAPIClasses/service";
import RaidRoomModel from "./raidRoom.model";

export default class RaidRoomService extends Service<IRaidRoom>{
    constructor(){
        super(RaidRoomModel);
    }
}