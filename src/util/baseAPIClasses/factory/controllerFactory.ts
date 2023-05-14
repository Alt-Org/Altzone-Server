import ControllerAbstract from "./../controllerAbstract";
import {ClassName} from "../../dictionary";
import PlayerDataController from '../../../playerData/playerData.controller';

//TODO: remove default from switch
export default class ControllerFactory{
    public create = (modelName: ClassName): ControllerAbstract => {
        switch(modelName){
            case ClassName.PLAYER_DATA:
                return new PlayerDataController();
            default:
                return new PlayerDataController();
        }
    }
}