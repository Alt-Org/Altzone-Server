import { Document, ObjectId } from "mongoose";

interface ICharacterClass extends Document{
    _id: ObjectId;
    gameId: number;
    name: string;
    mainDefence: number;
    speed: number;
    resistance: number;
    attack: number;
    defence: number;
}

interface ICreateCharacterClassInput {
    gameId: ICharacterClass['gameId'];
    name: ICharacterClass['name'];
    mainDefence: ICharacterClass['mainDefence'];
    speed: ICharacterClass['speed'];
    resistance: ICharacterClass['resistance'];
    attack: ICharacterClass['attack'];
    defence: ICharacterClass['defence'];
}

interface IUpdateCharacterClassInput {
    _id: ObjectId;
    gameId?: ICharacterClass['gameId'];
    name?: ICharacterClass['name'];
    mainDefence?: ICharacterClass['mainDefence'];
    speed?: ICharacterClass['speed'];
    resistance?: ICharacterClass['resistance'];
    attack?: ICharacterClass['attack'];
    defence?: ICharacterClass['defence'];
}


export { ICharacterClass, ICreateCharacterClassInput, IUpdateCharacterClassInput };