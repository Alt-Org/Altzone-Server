//If field name changed, remember to update both gameToAPI and apiToGame records
//If you are adding a new dictionary, please remember to add a new ClassName to ./className.ts file

export default class Dictionary {
    public static readonly values: Record<string, Record<string, Record<string, string>>> = {
        CharacterClass: {
            gameToAPI: {
                _id: "_id",
                CharacterClassId: "gameId",
                Name: "name",
                GestaltCycle: "mainDefence",
                Speed: "speed",
                Resistance: "resistance",
                Attack: "attack",
                Defence: "defence"
            },
            apiToGame: {
                _id: "_id",
                gameId: "CharacterClassId",
                name: "Name",
                mainDefence: "GestaltCycle",
                speed: "Speed",
                resistance: "Resistance",
                attack: "Attack",
                defence: "Defence"
            }
        },

        Clan: {
            gameToAPI: {
                _id: "_id",
                Id: "gameId",
                Name: "name",
                Tag: "tag",
                GameCoins: "gameCoins"
            },
            apiToGame: {
                _id: "_id",
                gameId: "Id",
                name: "Name",
                tag: "Tag",
                gameCoins: "GameCoins"
            }
        },

        CustomCharacter: {
            gameToAPI: {
                _id: "_id",
                Id: "gameId",
                UnityKey: "unityKey",
                Name: "name",
                Speed: "speed",
                Resistance: "resistance",
                Attack: "attack",
                Defence: "defence",
                CharacterClassId: "characterClassGameId",

                characterClass_id: "characterClass_id",
                playerData_id: "playerData_id"
            },
            apiToGame: {
                _id: "_id",
                gameId: "Id",
                unityKey: "UnityKey",
                name: "Name",
                speed: "Speed",
                resistance: "Resistance",
                attack: "Attack",
                defence: "Defence",
                characterClassGameId: "CharacterClassId",

                characterClass_id: "characterClass_id",
                playerData_id: "playerData_id"
            }
        },

        BattleCharacter: {
            gameToAPI: {
                _id: "_id",
                UnityKey: "unityKey",
                Name: "name",
                Speed: "speed",
                Resistance: "resistance",
                Attack: "attack",
                Defence: "defence",
                CustomCharacterId: "customCharacterGameId",

                CharacterClassId: "characterClassGameId",
                CharacterClassName: "characterClassName",
                GestaltCycle: "mainDefence",

                characterClass_id: "characterClass_id",
                customCharacter_id: "customCharacter_id"
            },
            apiToGame: {
                _id: "_id",
                unityKey: "UnityKey",
                name: "Name",
                speed: "Speed",
                resistance: "Resistance",
                attack: "Attack",
                defence: "Defence",
                customCharacterGameId: "CustomCharacterId",

                characterClassGameId: "CharacterClassId",
                characterClassName: "CharacterClassName",
                mainDefence: "GestaltCycle",

                characterClass_id: "characterClass_id",
                customCharacter_id: "customCharacter_id"
            }
        },

        PlayerData: {
            gameToAPI: {
                _id: "_id",
                Id: "gameId",
                Name: "name",
                BackpackCapacity: "backpackCapacity",
                UniqueIdentifier: "uniqueIdentifier",
                ClanId: "clanGameId",
                CurrentCustomCharacterId: "currentCustomCharacterGameId",

                Clan_id: "clan_id",
                CurrentCustomCharacter_id: "currentCustomCharacter_id"
            },
            apiToGame: {
                _id: "_id",
                gameId: "Id",
                name: "Name",
                backpackCapacity: "BackpackCapacity",
                uniqueIdentifier: "UniqueIdentifier",
                clanGameId: "ClanId",
                currentCustomCharacterGameId: "CurrentCustomCharacterId",

                clan_id: "Clan_id",
                currentCustomCharacter_id: "CurrentCustomCharacter_id"
            }
        },

        Furniture: {
            gameToAPI: {
                _id: "_id",
                Id: "gameId",
                Name: "name",
                Shape: "shape",
                Weight: "weight",
                Material: "material",
                Recycling: "recycling",
                UnityKey: "unityKey",
                Filename: "filename",
                ClanId: "clanGameId",

                clan_id: "clan_id"
            },
            apiToGame: {
                _id: "_id",
                gameId: "Id",
                name: "Name",
                shape: "Shape",
                weight: "Weight",
                material: "Material",
                recycling: "Recycling",
                unityKey: "UnityKey",
                filename: "Filename",
                clanGameId: "ClanId",

                clan_id: "clan_id"
            }
        },

        RaidRoom: {
            gameToAPI: {
                _id: "_id",
                Id: "gameId",
                Type: "type",
                RowCount: "rowCount",
                ColCount: "colCount",
                ClanMemberId: "clanMemberId",

                playerData_id: "playerData_id"
            },
            apiToGame: {
                _id: "_id",
                gameId: "Id",
                type: "Type",
                rowCount: "RowCount",
                colCount: "ColCount",
                clanMemberId: "ClanMemberId",

                playerData_id: "playerData_id"
            }
        }
    }
}