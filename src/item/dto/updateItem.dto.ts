import {IsBoolean, IsInt, IsMongoId, IsOptional, IsString, IsArray} from "class-validator";
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

    @IsInt()
    @IsOptional()
    weight: number;

    @IsString()
    @IsOptional()
    recycling: string;

    @IsString()
    @IsOptional()
    unityKey: string;

    @IsArray()
    @IsOptional()
    location: Array<number>;

    @IsInt()
    @IsOptional()
    price: number;

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

    @IsMongoId()
    @IsOptional()
    room_id: string;
}