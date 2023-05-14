import {ClassName} from "../util/dictionary";
import RouterBase from "../util/baseAPIClasses/routerBase";

export default class BattleCharacterRouter extends RouterBase{
    constructor() {
        super(ClassName.BATTLE_CHARACTER);
    }
}