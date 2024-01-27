import {ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {registerValidationDecorator} from "../../../common/decorator/validation/registerValidationDecorator";
import {isEntityExists} from "../../../common/decorator/validation/isEntityExists";
import {ModelName} from "../../../common/enum/modelName.enum";
import {RaidRoom} from "../../stock.schema";

export function IsRaidRoomExists(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string): void {
        registerValidationDecorator(IsRaidRoomExists.name, isRaidRoomExists, object, propertyName, validationOptions);
    };
}

@ValidatorConstraint({ name: isRaidRoomExists.name, async: true })
@Injectable()
export class isRaidRoomExists extends isEntityExists<RaidRoom> implements ValidatorConstraintInterface{
    public constructor(@InjectModel(ModelName.RAID_ROOM) private readonly model: Model<RaidRoom>) {
        super(ModelName.RAID_ROOM);
        super.setEntityModel(this.model);
    }
}