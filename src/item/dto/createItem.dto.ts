import {IsBoolean, IsInt, IsMongoId, IsOptional, IsString} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {IsStockExists} from "../../stock/decorator/validation/IsStockExists.decorator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('CreateItemDto')
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

    @IsStockExists()
    @IsMongoId()
    @IsOptional()
    stock_id: string;
}