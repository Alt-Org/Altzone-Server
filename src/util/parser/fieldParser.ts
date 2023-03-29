import {NextFunction, Request, Response} from "express";
import {ClassName, Dictionary} from '../dictionary';
import IFieldParser from "./IFieldParser";

export default class FieldParserFactory{
    public createParser = (parserType: ClassName): FieldParser => {
        return new FieldParser(parserType);
    }
}

class FieldParser implements IFieldParser{
    constructor(className: string) {
        this.gameToAPIDictionary = Dictionary.values[className]['gameToAPI'];
        this.apiToGameDictionary = Dictionary.values[className]['apiToGame'];
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

        //If this is an object
        if(apiResponse._doc){
            return this.convertAPIToGameObject(apiResponse._doc);
        }

        //If this is an array
        if(!apiResponse._doc){
            const result = [];
            for(let i=0; i<apiResponse.length; i++)
                result.push(this.convertAPIToGameObject(apiResponse[i]._doc));

            return result;
        }

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