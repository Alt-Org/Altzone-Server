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

                characterClass_id: "characterClass_id"
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

                characterClass_id: "characterClass_id"
            }
        }
    }
}