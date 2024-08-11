import {IsBoolean, IsInt, IsMongoId, IsOptional, IsString, IsArray} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {IsStockExists} from "../../stock/decorator/validation/IsStockExists.decorator";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('CreateItemDto')
export class CreateItemDto {
    @IsString()
    name: string;

    @IsInt()
    weight: number;

    @IsString()
    recycling: string;

    @IsString()
    unityKey: string;

    @IsArray()
    location: Array<number>;

    @IsInt()
    price: number;

    @IsBoolean()
    @IsOptional()
    isFurniture: boolean;

    @IsBoolean()
    @IsOptional()
    isInStock: boolean;

    @IsStockExists()
    @IsMongoId()
    @IsOptional()
    stock_id: string;   
}