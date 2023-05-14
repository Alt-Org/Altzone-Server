import {ICharacterClass} from "./characterClass";
import Service from "../util/baseAPIClasses/service";
import {ClassName} from "../util/dictionary";

export default class CharacterClassService extends Service<ICharacterClass>{
    constructor(){
        super(ClassName.CHARACTER_CLASS);
    }
}