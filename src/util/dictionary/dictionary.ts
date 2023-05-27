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
                Defence: "defence",
            },
            apiToGame: {
                _id: "_id",
                gameId: "CharacterClassId",
                name: "Name",
                mainDefence: "GestaltCycle",
                speed: "Speed",
                resistance: "Resistance",
                attack: "Attack",
                defence: "Defence",

                CustomCharacter: "CustomCharacter"
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
                gameCoins: "GameCoins",

                PlayerData: "PlayerDatas",
                RaidRoom: "RaidRooms",
                Furniture: "Furnitures"
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
                PlayerDataId: "playerDataGameId",

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
                playerDataGameId: "PlayerDataId",

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

                clan_id: "clan_id",
                raidRoom_id: "raidRoom_id",
                currentCustomCharacter_id: "currentCustomCharacter_id",
            },
            apiToGame: {
                _id: "_id",
                gameId: "Id",
                name: "Name",
                backpackCapacity: "BackpackCapacity",
                uniqueIdentifier: "UniqueIdentifier",
                clanGameId: "ClanId",
                currentCustomCharacterGameId: "CurrentCustomCharacterId",

                clan_id: "clan_id",
                raidRoom_id: "raidRoom_id",
                currentCustomCharacter_id: "currentCustomCharacter_id",
                Clan: "Clan",
                CurrentCustomCharacter: "CurrentCustomCharacter",
                RaidRoom: "RaidRoom",

                CustomCharacter: "CustomCharacters"
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
                ClanMemberId: "clanMemberGameId",
                ClanId: "clanGameId",

                playerData_id: "playerData_id",
                clan_id: "clan_id"
            },
            apiToGame: {
                _id: "_id",
                gameId: "Id",
                type: "Type",
                rowCount: "RowCount",
                colCount: "ColCount",
                clanMemberGameId: "ClanMemberId",

                playerData_id: "playerData_id",
                clan_id: "clan_id"
            }
        }
    }
}