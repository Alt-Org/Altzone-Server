import {NextFunction, Request, Response} from "express";
import {ParserType} from './parserType';
import * as dictionary from './dictionary';
import IFieldParser from "./IFieldParser";

export default class FieldParserFactory{
    public createParser = (parserType: ParserType): FieldParser => {
        switch (parserType) {
            case ParserType.CHARACTER_CLASS:
                return new FieldParser(dictionary.characterClassDictionary);
            case ParserType.CLAN:
                return new FieldParser(dictionary.clanDictionary);
        }
    }
}

class FieldParser implements IFieldParser{
    constructor(dictionary: any) {
        this.dictionary = dictionary;
    }

    private readonly dictionary: any;
    public parseFromGameToAPI = (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const bodyKeys = Object.keys(body);
        const newBody: any = {};

        for(let i=0; i<bodyKeys.length; i++){
            const currentKey = bodyKeys[i];
            const apiAnalog = this.dictionary[currentKey];

            if(apiAnalog !== undefined)
                newBody[apiAnalog] = body[currentKey];
            else
                console.error(`Warning: field ${currentKey} is not recognized. Please check the request body or util/parser/dictionary file`);
        }
        req.body = newBody;

        next();
    }
}