import {IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {IsPlayerExists} from "../../player/decorator/validation/IsPlayerExists.decorator";
import {IsCharacterClassExists} from "../../characterClass/decorator/validation/IsCharacterClassExists.decorator";
import {IsCustomCharacterExists} from "../decorator/validation/IsCustomCharacterExists.decorator";

export class UpdateCustomCharacterDto {
    @IsCustomCharacterExists()
    @IsMongoId()
    _id: string;

    @IsString()
    @IsOptional()
    unityKey: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsInt()
    @IsOptional()
    speed: number;

    @IsInt()
    @IsOptional()
    resistance: number;

    @IsInt()
    @IsOptional()
    attack: number;

    @IsInt()
    @IsOptional()
    defence: number;

    @IsCharacterClassExists()
    @IsMongoId()
    @IsOptional()
    characterClass_id: string;

    @IsPlayerExists()
    @IsMongoId()
    @IsOptional()
    player_id: string;
}