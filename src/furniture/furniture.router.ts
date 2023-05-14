import {ClassName} from "../util/dictionary";
import RouterBase from "../util/baseAPIClasses/routerBase";

export default class FurnitureRouter extends RouterBase{
    constructor() {
        super(ClassName.FURNITURE);
    }
}