import {ClassName} from "./className";

export default class CollectionRefs{
    public static readonly values: Record<ClassName, ICollectionRefs> = {
        Player: {
            inModelRefs: ['CurrentCustomCharacter', ClassName.CLAN, ClassName.RAID_ROOM],
            notInModelRefs: [
                { modelName: ClassName.CUSTOM_CHARACTER, foreignKey: 'player_id', isOne: false}
            ]
        },
        CharacterClass: {
            inModelRefs: [],
            notInModelRefs: [
                { modelName: ClassName.CUSTOM_CHARACTER, foreignKey: 'characterClass_id', isOne: false },
                { modelName: ClassName.BATTLE_CHARACTER, foreignKey: 'characterClass_id', isOne: true }
            ]
        },
        Clan: {
            inModelRefs: [],
            notInModelRefs: [
                { modelName: ClassName.PLAYER, foreignKey: 'clan_id', isOne: false },
                { modelName: ClassName.RAID_ROOM, foreignKey: 'clan_id', isOne: false },
                { modelName: ClassName.FURNITURE, foreignKey: 'clan_id', isOne: false }
            ]
        },
        CustomCharacter:  {
            inModelRefs: [ClassName.CHARACTER_CLASS, ClassName.PLAYER],
            notInModelRefs: [
                { modelName: ClassName.BATTLE_CHARACTER, foreignKey: 'customCharacter_id', isOne: true }
            ]
        },
        BattleCharacter:  {
            inModelRefs: [ClassName.CHARACTER_CLASS, ClassName.CUSTOM_CHARACTER],
            notInModelRefs: []
        },
        Furniture:  {
            inModelRefs: [ClassName.CLAN],
            notInModelRefs: []
        },
        RaidRoom:  {
            inModelRefs: [ClassName.PLAYER, ClassName.CLAN],
            notInModelRefs: []
        },
    }
}

interface ICollectionRefs {
    inModelRefs: string[];
    notInModelRefs: ICollectionRefInfo[]
}

export interface ICollectionRefInfo {
    modelName: ClassName,
    foreignKey: string,
    isOne: boolean
}