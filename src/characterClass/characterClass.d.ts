import { Document, ObjectId } from "mongoose";

interface ICharacterClass extends Document{
    _id: ObjectId;
    gameId: string;
    name: string;
    gestaltCycle: number;
    speed: number;
    resistance: number;
    attack: number;
    defence: number;
}

interface ICreateCharacterClassInput {
    name: ICharacterClass['name'];
    gestaltCycle: ICharacterClass['gestaltCycle'];
    speed: ICharacterClass['speed'];
    resistance: ICharacterClass['resistance'];
    attack: ICharacterClass['attack'];
    defence: ICharacterClass['defence'];
}

interface IUpdateCharacterClassInput {
    _id: ObjectId;
    name?: ICharacterClass['name'];
    gestaltCycle?: ICharacterClass['gestaltCycle'];
    speed?: ICharacterClass['speed'];
    resistance?: ICharacterClass['resistance'];
    attack?: ICharacterClass['attack'];
    defence?: ICharacterClass['defence'];
}


export { ICharacterClass, ICreateCharacterClassInput, IUpdateCharacterClassInput };