import {ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {CustomCharacter} from "../../customCharacter.schema";
import {registerValidationDecorator} from "../../../common/decorator/validation/registerValidationDecorator";
import {isEntityExists} from "../../../common/decorator/validation/isEntityExists";
import {ModelName} from "../../../common/enum/modelName.enum";

export function IsCustomCharacterExists(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string): void {
        registerValidationDecorator(IsCustomCharacterExists.name, isCustomCharacterExists, object, propertyName, validationOptions);
    };
}

@ValidatorConstraint({ name: isCustomCharacterExists.name, async: true })
@Injectable()
export class isCustomCharacterExists extends isEntityExists<CustomCharacter> implements ValidatorConstraintInterface{
    public constructor(@InjectModel(ModelName.CUSTOM_CHARACTER) private readonly model: Model<CustomCharacter>) {
        super(ModelName.CUSTOM_CHARACTER);
        super.setEntityModel(this.model);
    }
}