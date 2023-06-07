import Service from "../util/baseAPIClasses/service";
import {IPlayer} from "./player";
import PlayerDataModel from "./player.model";

export default class PlayerService extends Service<IPlayer>{
    public constructor(){
        super(PlayerDataModel);
    }
}