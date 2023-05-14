import Service from "../util/baseAPIClasses/service";
import {ClassName} from "../util/dictionary";
import {IPlayerData} from "./playerData";

export default class PlayerDataService extends Service<IPlayerData>{
    constructor(){
        super(ClassName.PLAYER_DATA);
    }
}