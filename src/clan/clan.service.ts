import {IClan} from "./clan";
import Service from "../util/baseAPIClasses/service";
import {ClassName} from "../util/dictionary";

export default class ClanService extends Service<IClan>{
    constructor(){
        super(ClassName.CLAN);
    }
}