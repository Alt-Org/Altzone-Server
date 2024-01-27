import {ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {registerValidationDecorator} from "../../../common/decorator/validation/registerValidationDecorator";
import {isEntityExists} from "../../../common/decorator/validation/isEntityExists";
import {ModelName} from "../../../common/enum/modelName.enum";
import {Furniture} from "../../item.schema";

export function IsFurnitureExists(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string): void {
        registerValidationDecorator(IsFurnitureExists.name, isFurnitureExists, object, propertyName, validationOptions);
    };
}

@ValidatorConstraint({ name: isFurnitureExists.name, async: true })
@Injectable()
export class isFurnitureExists extends isEntityExists<Furniture> implements ValidatorConstraintInterface{
    public constructor(@InjectModel(ModelName.ITEM) private readonly model: Model<Furniture>) {
        super(ModelName.ITEM);
        super.setEntityModel(this.model);
    }
}