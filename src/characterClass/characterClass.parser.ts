import {NextFunction, Request, Response} from "express";

const gameToAPI: any = {
    CharacterClassId: "gameId",
    Name: "name",
    DefenceClass: "mainDefence",
    Speed: "speed",
    Resistance: "resistance",
    Attack: "attack",
    Defence: "defence"
}

export default class CharacterClassParser{

    constructor(dictionary: any) {
        this.dictionary = dictionary;
    }

    private readonly dictionary: any;

    public parseFromGameToAPI = (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const bodyKeys = Object.keys(body);

        for(let i=0; i<bodyKeys.length; i++){
            const currentKey = bodyKeys[i];
            const apiAnalog = this.dictionary[currentKey];

            if(apiAnalog !== undefined)
                body[apiAnalog] = body[currentKey];
            else
                console.error(`Warning: field ${currentKey} is not recognized`);
        }

        next();
    }
}