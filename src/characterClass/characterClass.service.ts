import {ICharacterClass} from "./characterClass";
import Service from "../util/baseAPIClasses/service";
import CharacterClassModel from "./characterClass.model";

export default class CharacterClassService extends Service<ICharacterClass>{
    public constructor(){
        super(CharacterClassModel);
    }
}