import {Document, ObjectId } from "mongoose";

interface IBattleCharacter extends Document{
    _id: ObjectId;
    unityKey: string;
    name: string;
    resistance: number;
    speed: number;
    attack: number;
    defence: number;

    characterClassName: string;
    mainDefence: number;

    characterClass_id: ObjectId;
    customCharacter_id: ObjectId
}

interface ICreateBattleCharacterInput {
    characterClass_id: IBattleCharacter['characterClass_id'];
    customCharacter_id: IBattleCharacter['customCharacter_id'];
}

export { IBattleCharacter, ICreateBattleCharacterInput };