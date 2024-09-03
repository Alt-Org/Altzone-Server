import {IsBoolean, IsMongoId} from "class-validator";
import {IsProfileExists} from "../../profile/decorator/validation/IsProfileExists.decorator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('UpdateSystemAdminDto')
export class UpdateSystemAdminDto {
    @IsProfileExists()
    @IsMongoId()
    _id: string;

    @IsBoolean()
    isSystemAdmin: boolean;
}