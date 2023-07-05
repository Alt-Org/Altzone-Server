import {ModelName} from "../../common/enum/modelName.enum";

export default class CollectionRefs{
    public static readonly values: Record<ModelName, ICollectionRefs> = {
        Player: {
            inModelRefs: ['CurrentCustomCharacter', ModelName.CLAN, ModelName.RAID_ROOM],
            notInModelRefs: [
                { modelName: ModelName.CUSTOM_CHARACTER, foreignKey: 'player_id', isOne: false}
            ]
        },
        CharacterClass: {
            inModelRefs: [],
            notInModelRefs: [
                { modelName: ModelName.CUSTOM_CHARACTER, foreignKey: 'characterClass_id', isOne: false },
                { modelName: ModelName.BATTLE_CHARACTER, foreignKey: 'characterClass_id', isOne: true }
            ]
        },
        Clan: {
            inModelRefs: [],
            notInModelRefs: [
                { modelName: ModelName.PLAYER, foreignKey: 'clan_id', isOne: false },
                { modelName: ModelName.RAID_ROOM, foreignKey: 'clan_id', isOne: false },
                { modelName: ModelName.FURNITURE, foreignKey: 'clan_id', isOne: false }
            ]
        },
        CustomCharacter:  {
            inModelRefs: [ModelName.CHARACTER_CLASS, ModelName.PLAYER],
            notInModelRefs: [
                { modelName: ModelName.BATTLE_CHARACTER, foreignKey: 'customCharacter_id', isOne: true }
            ]
        },
        BattleCharacter:  {
            inModelRefs: [ModelName.CHARACTER_CLASS, ModelName.CUSTOM_CHARACTER],
            notInModelRefs: []
        },
        Furniture:  {
            inModelRefs: [ModelName.CLAN],
            notInModelRefs: []
        },
        RaidRoom:  {
            inModelRefs: [ModelName.PLAYER, ModelName.CLAN],
            notInModelRefs: []
        },
    }
}

interface ICollectionRefs {
    inModelRefs: string[];
    notInModelRefs: ICollectionRefInfo[]
}

export interface ICollectionRefInfo {
    modelName: ModelName,
    foreignKey: string,
    isOne: boolean
}