import {ClassName} from "../util/dictionary";
import RouterBase from "../util/baseAPIClasses/routerBase";

export default class CharacterClassRouter extends RouterBase{
    constructor() {
        super(ClassName.CHARACTER_CLASS);
    }
}