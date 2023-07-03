import { ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Clan} from "../../clan.schema";
import {isEntityExists} from "../../../util/baseAPIClasses/decorator/validation/isEntityExists";
import {
    registerValidationDecorator
} from "../../../util/baseAPIClasses/decorator/validation/registerValidationDecorator";

export function IsClanExists(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerValidationDecorator('IsClanExists', isClanExists, object, propertyName, validationOptions);
    };
}

@ValidatorConstraint({ name: 'isClanExists', async: true })
@Injectable()
export class isClanExists extends isEntityExists<Clan> implements ValidatorConstraintInterface{
    public constructor(@InjectModel(Clan.name) private readonly model: Model<Clan>) {
        super('Clan');
        super.setEntityModel(this.model);
    }
}