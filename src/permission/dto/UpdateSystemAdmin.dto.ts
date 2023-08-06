import {IsBoolean, IsMongoId} from "class-validator";
import {IsProfileExists} from "../../profile/decorator/validation/IsProfileExists.decorator";

export class UpdateSystemAdminDto {
    @IsProfileExists()
    @IsMongoId()
    _id: string;

    @IsBoolean()
    isSystemAdmin: boolean;
}