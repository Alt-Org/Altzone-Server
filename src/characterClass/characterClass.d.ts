import { Document, ObjectId } from "mongoose";

interface ICharacterClass extends Document{
    _id: ObjectId;
    name: string;
    mainDefence: Number;
    speed: int;
    resistance: int;
    attack: int;
    defence: int;
}

interface ICreateCharacterClassInput {
    name: ICharacterClass['name'];
    mainDefence: ICharacterClass['mainDefence'];
    speed: ICharacterClass['speed'];
    resistance: ICharacterClass['resistance'];
    attack: ICharacterClass['attack'];
    defence: ICharacterClass['defence'];
}

interface IUpdateCharacterClassInput {
    id: ObjectId;
    name?: ICharacterClass['name'];
    mainDefence?: ICharacterClass['mainDefence'];
    speed?: ICharacterClass['speed'];
    resistance?: ICharacterClass['resistance'];
    attack?: ICharacterClass['attack'];
    defence?: ICharacterClass['defence'];
}


export { ICharacterClass, ICreateCharacterClassInput, IUpdateCharacterClassInput };