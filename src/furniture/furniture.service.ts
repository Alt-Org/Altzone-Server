import {IFurniture} from "./furniture";
import Service from "../util/baseAPIClasses/service";
import {ClassName} from "../util/dictionary";

export default class FurnitureService extends Service<IFurniture>{
    constructor(){
        super(ClassName.FURNITURE);
    }
}