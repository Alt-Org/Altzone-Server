import { Document, ObjectId } from "mongoose";

interface ICharacterClass extends Document{
    _id: ObjectId;
    gameId: string;
    name: string;
    mainDefence: number;
    speed: number;
    resistance: number;
    attack: number;
    defence: number;
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
    _id: ObjectId;
    name?: ICharacterClass['name'];
    mainDefence?: ICharacterClass['mainDefence'];
    speed?: ICharacterClass['speed'];
    resistance?: ICharacterClass['resistance'];
    attack?: ICharacterClass['attack'];
    defence?: ICharacterClass['defence'];
}


export { ICharacterClass, ICreateCharacterClassInput, IUpdateCharacterClassInput };