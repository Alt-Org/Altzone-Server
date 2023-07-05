import {ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {registerValidationDecorator} from "../../../common/decorator/validation/registerValidationDecorator";
import {isEntityExists} from "../../../common/decorator/validation/isEntityExists";
import {ModelName} from "../../../common/enum/modelName.enum";
import {CharacterClass} from "../../characterClass.schema";

export function IsCharacterClassExists(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string): void {
        registerValidationDecorator(IsCharacterClassExists.name, isCharacterClassExists, object, propertyName, validationOptions);
    };
}

@ValidatorConstraint({ name: isCharacterClassExists.name, async: true })
@Injectable()
export class isCharacterClassExists extends isEntityExists<CharacterClass> implements ValidatorConstraintInterface{
    public constructor(@InjectModel(ModelName.CHARACTER_CLASS) private readonly model: Model<CharacterClass>) {
        super(ModelName.CHARACTER_CLASS);
        super.setEntityModel(this.model);
    }
}