import {ClassName} from "../util/dictionary";
import RouterBase from "../util/baseAPIClasses/routerBase";

export default class CustomCharacterRouter extends RouterBase{
    constructor() {
        super(ClassName.CUSTOM_CHARACTER);
    }
}