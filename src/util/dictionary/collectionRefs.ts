import {ClassName} from "./className";

export default class CollectionRefs{
    public static readonly values: Record<ClassName, ICollectionRefs> = {
        PlayerData: {
            inModelRefs: ['CurrentCustomCharacter', ClassName.CLAN, ClassName.RAID_ROOM],
            notInModelRefs: [
                { modelName: ClassName.CUSTOM_CHARACTER, foreignKey: 'playerData_id', isOne: false}
            ]
        },
        CharacterClass: {
            inModelRefs: [],
            notInModelRefs: [{ modelName: ClassName.CUSTOM_CHARACTER, foreignKey: 'characterClass_id', isOne: true }]
        },
        Clan: {
            inModelRefs: [],
            notInModelRefs: [
                { modelName: ClassName.PLAYER_DATA, foreignKey: 'clan_id', isOne: false },
                { modelName: ClassName.RAID_ROOM, foreignKey: 'clan_id', isOne: false },
                { modelName: ClassName.FURNITURE, foreignKey: 'clan_id', isOne: false },
            ]
        },
        CustomCharacter:  { inModelRefs: [], notInModelRefs: [] },
        BattleCharacter:  { inModelRefs: [], notInModelRefs: [] },
        Furniture:  { inModelRefs: [], notInModelRefs: [] },
        RaidRoom:  { inModelRefs: [], notInModelRefs: [] },
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