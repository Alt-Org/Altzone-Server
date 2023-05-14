import {ClassName} from "../../dictionary";
import ValidatorAbstract from "./../validatorAbstract";
import PlayerDataValidator from "../../../playerData/playerData.validator";

//TODO: remove default from switch
export default class ValidatorFactory{
    public create = (modelName: ClassName): ValidatorAbstract => {
        switch (modelName) {
            case ClassName.PLAYER_DATA:
                return new PlayerDataValidator();
            default:
                return new PlayerDataValidator();
        }
    }
}