import { Document, ObjectId } from "mongoose";

interface ICustomCharacter extends Document{
    _id: ObjectId;
    unityKey: string;
    name: string;
    speed: number;
    resistance: number;
    attack: number;
    defence: number;

    characterClass_id: ObjectId;
    playerData_id: ObjectId;
}

interface ICreateCustomCharacterInput {
    unityKey: ICustomCharacter['unityKey'];
    name: ICustomCharacter['name'];
    speed: ICustomCharacter['speed'];
    resistance: ICustomCharacter['resistance'];
    attack: ICustomCharacter['attack'];
    defence: ICustomCharacter['defence'];

    characterClass_id: ICustomCharacter['characterClass_id'];
    playerData_id: ICustomCharacter['playerData_id'];
}

interface IUpdateCustomCharacterInput {
    _id: ICustomCharacter['_id'];
    unityKey?: ICustomCharacter['unityKey'];
    name?: ICustomCharacter['name'];
    speed?: ICustomCharacter['speed'];
    resistance?: ICustomCharacter['resistance'];
    attack?: ICustomCharacter['attack'];
    defence?: ICustomCharacter['defence'];

    characterClass_id?: ICustomCharacter['characterClass_id'];
    playerData_id?: ICustomCharacter['playerData_id'];
}

export { ICustomCharacter, ICreateCustomCharacterInput, IUpdateCustomCharacterInput };