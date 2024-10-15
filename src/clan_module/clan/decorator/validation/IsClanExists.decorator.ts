import {ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import { registerValidationDecorator } from "../../../../common/decorator/validation/registerValidationDecorator";
import { isEntityExists } from "../../../../common/decorator/validation/isEntityExists";
import { ModelName } from "../../../../common/enum/modelName.enum";
import { Clan } from "../../clan.schema";

export function IsClanExists(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string): void {
        registerValidationDecorator(IsClanExists.name, isClanExists, object, propertyName, validationOptions);
    };
}

@ValidatorConstraint({ name: isClanExists.name, async: true })
@Injectable()
export class isClanExists extends isEntityExists<Clan> implements ValidatorConstraintInterface{
    public constructor(@InjectModel(ModelName.CLAN) private readonly model: Model<Clan>) {
        super(ModelName.CLAN);
        super.setEntityModel(this.model);
    }
}