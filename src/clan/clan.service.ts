import {IClan} from "./clan";
import Service from "../util/baseAPIClasses/service";
import ClanModel from "./clan.model";

export default class ClanService extends Service<IClan>{
    constructor(){
        super(ClanModel);
    }
}