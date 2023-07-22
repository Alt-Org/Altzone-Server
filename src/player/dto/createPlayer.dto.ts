import {IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {IsRaidRoomExists} from "../../raidRoom/decorator/validation/IsRaidRoomExists.decorator";
import {IsCustomCharacterExists} from "../../customCharacter/decorator/validation/IsCustomCharacterExists.decorator";
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

    @IsClanExists()
    @IsMongoId()
    @IsOptional()
    clan_id: string;

    @IsRaidRoomExists()
    @IsMongoId()
    @IsOptional()
    raidRoom_id: string;

    @IsCustomCharacterExists()
    @IsMongoId()
    @IsOptional()
    currentCustomCharacter_id: string;
}