import {body, param, query, ValidationChain} from 'express-validator';
import {Location} from "./location";
import {DefenceEnum} from "../../enums/defence.enum";
import Dictionary from "../dictionary/dictionary";

export class ValidationChainBuilder {
    public constructor(fieldName: string, fieldLocation: Location, className?: string) {
        this.name = fieldName;
        if(className){
            this.nameAlias = Dictionary.values[className]['apiToGame'][fieldName];
            this.nameAliasString = `(${this.nameAlias} on game side)`;
        } else
            this.nameAliasString = '(No analog on game side)';

        this.location = fieldLocation;
        this.validationChain = this.getValidationChainStart();
    }
    private readonly name: string;
    private readonly nameAlias?: string;
    private readonly nameAliasString: string;
    private readonly location: Location;
    private readonly validationChain: ValidationChain;

    public notEmpty = (text?: string, overrideDefaultText?: boolean) : ValidationChainBuilder => {
        const errorMsg: string = this.getErrorText(`${this.location} ${this.name} ${this.nameAliasString} can not be empty`, text, overrideDefaultText);

        this.validationChain.notEmpty({ignore_whitespace: true}).withMessage(errorMsg);
        return this;
    }

    public isString = (text?: string, overrideDefaultText?: boolean) : ValidationChainBuilder => {
        const errorMsg: string = this.getErrorText(`${this.location} ${this.name} ${this.nameAliasString} must be string type`, text, overrideDefaultText);

        this.validationChain.isString().withMessage(errorMsg);
        return this;
    }

    public isMongoId = (text?: string, overrideDefaultText?: boolean) : ValidationChainBuilder => {
        const errorMsg: string = this.getErrorText(`${this.location} ${this.name} ${this.nameAliasString} must be in Mongo ObjectId form`, text, overrideDefaultText);

        this.validationChain.isMongoId().withMessage(errorMsg);
        return this;
    }

    public isInt = (text?: string, overrideDefaultText?: boolean) : ValidationChainBuilder => {
        const errorMsg: string = this.getErrorText(`${this.location} ${this.name} ${this.nameAliasString} must be int type`, text, overrideDefaultText);

        this.validationChain.isInt().withMessage(errorMsg);
        return this;
    }

    public isDouble = (text?: string, overrideDefaultText?: boolean) : ValidationChainBuilder => {
        const errorMsg: string = this.getErrorText(`${this.location} ${this.name} ${this.nameAliasString} must be double type`, text, overrideDefaultText);

        this.validationChain.isFloat().withMessage(errorMsg);
        return this;
    }

    public ifProvided = () : ValidationChainBuilder => {
        this.validationChain.if(this.getValidationChainStart().exists());
        return this;
    }

    public isDefenceEnumType = (text?: string, overrideDefaultText?: boolean): ValidationChainBuilder => {
        this.validationChain.custom( (value) => {
            if (!(typeof value === "number") || Object.values(DefenceEnum).find( elem => elem === value ) === undefined) {
                const errorMsg: string = this.getErrorText(`${this.location} ${this.name} ${this.nameAliasString} must be DefenceEnum type`, text, overrideDefaultText);
                throw new Error(errorMsg);
            }

            return true;
        });

        return this;
    }

    public build = (): ValidationChain => {
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