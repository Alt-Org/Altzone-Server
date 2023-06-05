import Service from "../util/baseAPIClasses/service";
import {IPlayerData} from "./playerData";
import PlayerDataModel from "./playerData.model";

export default class PlayerDataService extends Service<IPlayerData>{
    constructor(){
        super(PlayerDataModel);
    }
}