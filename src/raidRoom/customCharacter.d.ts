import { Document, ObjectId } from "mongoose";

interface ICustomCharacter extends Document{
    _id: ObjectId;
    gameId: number;
    unityKey: string;
    name: string;
    speed: number;
    resistance: number;
    attack: number;
    defence: number;
    characterClassGameId: number;

    characterClass_id: ObjectId;
}

interface ICreateCustomCharacterInput {
    gameId: ICustomCharacter['gameId'];
    unityKey: ICustomCharacter['unityKey'];
    name: ICustomCharacter['name'];
    speed: ICustomCharacter['speed'];
    resistance: ICustomCharacter['resistance'];
    attack: ICustomCharacter['attack'];
    defence: ICustomCharacter['defence'];
    characterClassGameId: ICustomCharacter['characterClassGameId'];

    characterClass_id: ICustomCharacter['characterClass_id'];
}

interface IUpdateCustomCharacterInput {
    _id: ObjectId;
    gameId?: ICustomCharacter['gameId'];
    unityKey?: ICustomCharacter['unityKey'];
    name?: ICustomCharacter['name'];
    speed?: ICustomCharacter['speed'];
    resistance?: ICustomCharacter['resistance'];
    attack?: ICustomCharacter['attack'];
    defence?: ICustomCharacter['defence'];
    characterClassGameId?: ICustomCharacter['characterClassGameId'];

    characterClass_id?: ICustomCharacter['characterClass_id'];
}

export { ICustomCharacter, ICreateCustomCharacterInput, IUpdateCustomCharacterInput };