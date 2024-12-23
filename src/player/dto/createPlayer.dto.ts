import {IsBoolean, IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {IsProfileExists} from "../../profile/decorator/validation/IsProfileExists.decorator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('CreatePlayerDto')
export class CreatePlayerDto {
    @IsString()
    name: string;

    @IsInt()
    backpackCapacity: number;

    @IsString()
    uniqueIdentifier: string;

    @IsOptional()
    @IsBoolean()
    above13?: boolean;

    @IsOptional()
    @IsBoolean()
    parentalAuth?: boolean;

    @IsOptional()
    @IsProfileExists()
    @IsMongoId()
    profile_id?: string;
}