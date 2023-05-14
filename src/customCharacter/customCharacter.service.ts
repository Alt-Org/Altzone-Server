import {ICustomCharacter} from "./customCharacter";
import Service from "../util/baseAPIClasses/service";
import {ClassName} from "../util/dictionary";

export default class CustomCharacterService extends Service<ICustomCharacter>{
    constructor(){
        super(ClassName.CUSTOM_CHARACTER);
    }
}