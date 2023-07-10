import {IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {IsClanExists} from "../decorator/validation/IsClanExists.decorator";

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
}