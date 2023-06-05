import {NextFunction, Request, Response} from "express";
import IFieldParser from "./IFieldParser";

export default abstract class  FieldParser implements IFieldParser{
    protected constructor(gameToAPIDictionary: Record<string, string>, apiToGameDictionary: Record<string, string>) {
        this.gameToAPIDictionary = gameToAPIDictionary;
        this.apiToGameDictionary = apiToGameDictionary;
    }

    private readonly gameToAPIDictionary: Record<string, string>;
    private readonly apiToGameDictionary: Record<string, string>;
    public parseFromGameToAPI = (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const bodyKeys = Object.keys(body);
        const newBody: any = {};

        for(let i=0; i<bodyKeys.length; i++){
            const currentKey = bodyKeys[i];
            const apiAnalog = this.gameToAPIDictionary[currentKey];

            if(apiAnalog !== undefined)
                newBody[apiAnalog] = body[currentKey];
            else
                console.error(`Warning: field ${currentKey} is not recognized. Please check the request body or util/parser/dictionary file`);
        }
        req.body = newBody;

        next();
    }

    public parseFromAPIToGame = (apiResponse: Object | any): Object | Object[] | null => {

        //If this is an MongoDB object
        if(apiResponse._doc){
            return this.convertAPIToGameObject(apiResponse._doc);
        }

        //If this is an array
        if(!apiResponse._doc && apiResponse.length){
            const result = [];
            for(let i=0; i<apiResponse.length; i++)
                result.push(this.convertAPIToGameObject(apiResponse[i]._doc));

            return result;
        }

        //If it is a JS object
        if((typeof apiResponse) === 'object')
            return this.convertAPIToGameObject(apiResponse);

        return null;
    }

    private convertAPIToGameObject = (object: Object | any): Object => {
        const objKeys = Object.keys(object);
        const result: any = {};

        for(let i=0; i<objKeys.length; i++){
            const currentKey: any = objKeys[i];
            const gameAnalog: string = this.apiToGameDictionary[currentKey];

            if(gameAnalog !== undefined)
                result[gameAnalog] = object[currentKey];
        }

        return result;
    }
}