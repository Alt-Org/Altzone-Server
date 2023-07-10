import {IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {RaidRoom} from "../../raidRoom/raidRoom.schema";

export class CreatePlayerDto {
    @IsString()
    name: string;

    @IsInt()
    backpackCapacity: number;

    @IsString()
    uniqueIdentifier: string;

    @IsClanExists()
    @IsMongoId()
    @IsOptional()
    clan_id: string;

    @IsClanExists()
    @IsMongoId()
    @IsOptional()
    raidRoom_id: string;

    @IsClanExists()
    @IsMongoId()
    @IsOptional()
    currentCustomCharacter_id: string;
}