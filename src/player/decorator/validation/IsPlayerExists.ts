import { ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Player} from "../../player.schema";
import {isEntityExists} from "../../../util/baseAPIClasses/decorator/validation/isEntityExists";
import {
    registerValidationDecorator
} from "../../../util/baseAPIClasses/decorator/validation/registerValidationDecorator";

export function IsPlayerExists(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerValidationDecorator('IsPlayerExists', isPlayerExists, object, propertyName, validationOptions);
    };
}

@ValidatorConstraint({ name: 'isPlayerExists', async: true })
@Injectable()
export class isPlayerExists extends isEntityExists<Player> implements ValidatorConstraintInterface{
    public constructor(@InjectModel(Player.name) private readonly model: Model<Player>) {
        super('Player');
        super.setEntityModel(this.model);
    }
}