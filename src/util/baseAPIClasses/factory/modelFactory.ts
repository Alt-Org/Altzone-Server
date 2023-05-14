import {Model} from "mongoose";
import {ClassName} from "../../dictionary";
import PlayerDataModel from "../../../playerData/playerData.model";

//TODO: remove default from switch
export default class ModelFactory {
    public create = (modelName: ClassName): Model<any> => {
        switch (modelName) {
            case ClassName.PLAYER_DATA:
                return PlayerDataModel;
            default:
                return PlayerDataModel;
        }
    }
}