import {IsBoolean, IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";

export class CreateItemDto {
    @IsString()
    name: string;

    @IsString()
    shape: string;

    @IsInt()
    weight: number;

    @IsString()
    material: string;

    @IsString()
    recycling: string;

    @IsString()
    unityKey: string;

    @IsString()
    filename: string;

    @IsInt()
    @IsOptional()
    rowNumber: number;

    @IsInt()
    @IsOptional()
    columnNumber: number;

    @IsBoolean()
    @IsOptional()
    isInStock: boolean;

    @IsBoolean()
    @IsOptional()
    isFurniture: boolean;

    @IsClanExists()
    @IsMongoId()
    @IsOptional()
    stock_id: string;
}