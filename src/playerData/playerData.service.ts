import PlayerDataModel, {CollectionRefs} from "./playerData.model";
import  {MongooseError} from "mongoose";
import {ICreatePlayerDataInput, IUpdatePlayerDataInput} from "./playerData.d";
import RequestError from "../util/error/requestError";
import {UpdateResult} from "mongodb";
import RequestHelper from "../util/request/requestHelper";
import Service from "../util/service/service";
import {ClassName} from "../util/dictionary";
import { IPlayerData } from "./playerData";


const requestHelper = new RequestHelper();
export default class PlayerDataService extends Service<IPlayerData>{
    constructor(){
        super(ClassName.PLAYER_DATA);
    }
}