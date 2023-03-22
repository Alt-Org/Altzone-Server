export const characterClassDictionary: Record<string, string> = {
    _id: "_id",
    CharacterClassId: "gameId",
    Name: "name",
    GestaltCycle: "mainDefence",
    Speed: "speed",
    Resistance: "resistance",
    Attack: "attack",
    Defence: "defence"
} as const;

export const clanDictionary: Record<string, string> = {
    _id: "_id",
    Id: "gameId",
    Name: "name",
    Tag: "tag",
    GameCoins: "gameCoins"
} as const;