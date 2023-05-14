import { IController } from "./controller.d";
import {ClassName} from "../dictionary";
import PlayerDataController from '../../playerData/playerData.controller';

export default class ControllerFactory{
    public create = (modelName: ClassName): IController => {
        switch(modelName){
            case ClassName.PLAYER_DATA:
                return new PlayerDataController();
        }
    }
}