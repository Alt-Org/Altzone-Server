import {IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {IsFurnitureExists} from "../decorator/validation/IsItemExists.decorator";

export class UpdateItemDto {
    @IsFurnitureExists()
    @IsMongoId()
    _id: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    shape: string;

    @IsInt()
    @IsOptional()
    weight: number;

    @IsString()
    @IsOptional()
    material: string;

    @IsString()
    @IsOptional()
    recycling: string;

    @IsString()
    @IsOptional()
    unityKey: string;

    @IsString()
    @IsOptional()
    filename: string;

    @IsClanExists()
    @IsMongoId()
    @IsOptional()
    clan_id: string;
}