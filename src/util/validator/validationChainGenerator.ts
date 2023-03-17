import {body, param, query, ValidationChain} from 'express-validator';
import {Location} from "./location";

export default class ValidationChainGenerator {
    public constructor(fieldName: string, fieldLocation: Location) {
        this.name = fieldName;
        this.location = fieldLocation;
        this.validationChain = this.getValidationChainStart();
    }
    private readonly name: string;
    private readonly location: Location;
    private readonly validationChain: ValidationChain;

    public notEmpty = (text?: string, overrideDefaultText?: boolean) : ValidationChainGenerator => {
        const errorMsg: string = this.getErrorText(`${this.location} ${this.name} can not be empty`, text, overrideDefaultText);

        this.validationChain.notEmpty({ignore_whitespace: true}).withMessage(errorMsg);
        return this;
    }

    public isString = (text?: string, overrideDefaultText?: boolean) : ValidationChainGenerator => {
        const errorMsg: string = this.getErrorText(`${this.location} ${this.name} must be string type`, text, overrideDefaultText);

        this.validationChain.isString().withMessage(errorMsg);
        return this;
    }

    public isMongoId = (text?: string, overrideDefaultText?: boolean) : ValidationChainGenerator => {
        const errorMsg: string = this.getErrorText(`${this.location} ${this.name} must be in Mongo ObjectId form`, text, overrideDefaultText);

        this.validationChain.isMongoId().withMessage(errorMsg);
        return this;
    }

    public isInt = (text?: string, overrideDefaultText?: boolean) : ValidationChainGenerator => {
        const errorMsg: string = this.getErrorText(`${this.location} ${this.name} must be int type`, text, overrideDefaultText);

        this.validationChain.isInt().withMessage(errorMsg);
        return this;
    }

    public ifProvided = () : ValidationChainGenerator => {
        this.validationChain.if(this.getValidationChainStart().exists());
        return this;
    }

    public generate = (): ValidationChain => {
        return this.validationChain;
    }

    private getValidationChainStart = (): ValidationChain => {
        switch (this.location) {
            case Location.BODY:
                return body(this.name);
            case Location.QUERY:
                return query(this.name);
            case Location.PARAM:
                return param(this.name);
        }
    }

    private getErrorText = (defaultMessage: string, text: string | undefined, overrideDefaultText: boolean | undefined): string => {
        if(text)
            return !overrideDefaultText ? defaultMessage + ". " + text : text;
        else
            return defaultMessage;
    }
}