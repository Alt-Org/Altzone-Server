import {IsBoolean, IsInt, IsMongoId, IsOptional, IsString, IsArray} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {IsStockExists} from "../../stock/decorator/validation/IsStockExists.decorator";
import AddType from "src/common/base/decorator/AddType.decorator";
import { recycling } from "src/common/enum/recycling.enum";

@AddType('CreateItemDto')
export class CreateItemDto {
    @IsString()
    name: string;

    @IsInt()
    weight: number;

    @IsString()
    recycling: recycling;

    @IsString()
    unityKey: string;

    @IsArray()
    location: Array<number>;

    @IsInt()
    price: number;

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