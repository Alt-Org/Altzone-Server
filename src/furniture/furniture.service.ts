import {IFurniture} from "./furniture";
import Service from "../util/baseAPIClasses/service";
import FurnitureModel from "./furniture.model";

export default class FurnitureService extends Service<IFurniture>{
    constructor(){
        super(FurnitureModel);
    }
}