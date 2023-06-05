import {ICustomCharacter} from "./customCharacter";
import Service from "../util/baseAPIClasses/service";
import CustomCharacterModel from "./customCharacter.model";

export default class CustomCharacterService extends Service<ICustomCharacter>{
    constructor(){
        super(CustomCharacterModel);
    }
}