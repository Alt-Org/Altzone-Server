import {IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {IsPlayerExists} from "../decorator/validation/IsPlayerExists.decorator";
import {IsCustomCharacterExists} from "../../customCharacter/decorator/validation/IsCustomCharacterExists.decorator";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('UpdatePlayerDto')
export class UpdatePlayerDto {
    @IsPlayerExists()
    @IsMongoId()
    _id: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsInt()
    @IsOptional()
    backpackCapacity: number;

    @IsString()
    @IsOptional()
    uniqueIdentifier: string;

    @IsClanExists()
    @IsMongoId()
    @IsOptional()
    clan_id: string;

    @IsClanExists()
    @IsMongoId()
    @IsOptional()
    clan_idToDelete: string;

    @IsCustomCharacterExists()
    @IsMongoId()
    @IsOptional()
    currentCustomCharacter_id: string;
}