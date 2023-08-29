import {IsInt, IsMongoId, IsString} from "class-validator";
import {IsProfileExists} from "../../profile/decorator/validation/IsProfileExists.decorator";

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