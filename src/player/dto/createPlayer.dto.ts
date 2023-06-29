import {IsInt, IsMongoId, IsString} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists";

export class CreatePlayerDto {
    @IsString()
    name: string;

    @IsInt()
    backpackCapacity: number;

    @IsString()
    uniqueIdentifier: string;

    @IsClanExists()
    @IsMongoId()
    clan_id: string;
}