import {IsBoolean, IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {IsItemExists} from "../decorator/validation/IsItemExists.decorator";
import {IsStockExists} from "../../stock/decorator/validation/IsStockExists.decorator";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('UpdateItemDto')
export class UpdateItemDto {
    @IsItemExists()
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

    @IsStockExists()
    @IsMongoId()
    @IsOptional()
    stock_id: string;
}