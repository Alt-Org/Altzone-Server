import {ClassName} from "../util/dictionary";
import RouterBase from "../util/baseAPIClasses/routerBase";

export default class ClanRouter extends RouterBase{
    constructor() {
        super(ClassName.CLAN);
    }
}