import {IsInt, IsMongoId, IsString} from "class-validator";
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

    @IsProfileExists()
    @IsMongoId()
    profile_id: string;
}