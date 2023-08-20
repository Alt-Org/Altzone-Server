import {ArrayNotEmpty, IsArray, IsInt, IsMongoId, IsOptional, IsString, Validate} from "class-validator";
import {IsClanExists} from "../decorator/validation/IsClanExists.decorator";
import { IsPlayerExists } from "src/player/decorator/validation/IsPlayerExists.decorator";

export class UpdateClanDto {
    @IsClanExists()
    @IsMongoId()
    _id: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    tag: string;

    @IsInt()
    @IsOptional()
    gameCoins: number;

    @IsArray()
    @ArrayNotEmpty()
    @Validate(IsPlayerExists)
    @IsOptional()
    admin_idsToAdd: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsOptional()
    admin_idsToDelete: string[];
}