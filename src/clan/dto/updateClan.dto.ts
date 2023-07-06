import {IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {IsClanExists} from "../decorator/validation/IsClanExists.decorator";
import {IsPlayerExists} from "../../player/decorator/validation/IsPlayerExists.decorator";

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

    // @IsPlayerExists()
    // @IsMongoId()
    // @IsOptional()
    // player_id: string;
}