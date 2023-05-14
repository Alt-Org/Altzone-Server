import {ClassName} from "../util/dictionary";
import RouterBase from "../util/baseAPIClasses/routerBase";

export default class PlayerDataRouter extends RouterBase{
    constructor() {
        super(ClassName.PLAYER_DATA);
    }
}