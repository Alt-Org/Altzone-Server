import {IsBoolean, IsInt, IsMongoId, IsOptional, IsString, IsArray, IsEnum } from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {IsStockExists} from "../../stock/decorator/validation/IsStockExists.decorator";
import AddType from "../../common/base/decorator/AddType.decorator";
import { Recycling } from "../enum/recycling.enum";

@AddType('CreateItemDto')
export class CreateItemDto {
    @IsString()
    name: string;

    @IsInt()
    weight: number;

    @IsEnum(Recycling)
    recycling: Recycling;

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