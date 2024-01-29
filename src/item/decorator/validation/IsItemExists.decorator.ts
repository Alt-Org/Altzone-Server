import {ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {registerValidationDecorator} from "../../../common/decorator/validation/registerValidationDecorator";
import {isEntityExists} from "../../../common/decorator/validation/isEntityExists";
import {ModelName} from "../../../common/enum/modelName.enum";
import {Item} from "../../item.schema";

export function IsItemExists(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string): void {
        registerValidationDecorator(IsItemExists.name, isItemExists, object, propertyName, validationOptions);
    };
}

@ValidatorConstraint({ name: isItemExists.name, async: true })
@Injectable()
export class isItemExists extends isEntityExists<Item> implements ValidatorConstraintInterface{
    public constructor(@InjectModel(ModelName.ITEM) private readonly model: Model<Item>) {
        super(ModelName.ITEM);
        super.setEntityModel(this.model);
    }
}