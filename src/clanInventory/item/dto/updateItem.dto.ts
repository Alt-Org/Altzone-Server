import {IsBoolean, IsInt, IsMongoId, IsOptional, IsString, IsArray, IsEnum} from "class-validator";
import {IsItemExists} from "../decorator/validation/IsItemExists.decorator";
import {IsStockExists} from "../../stock/decorator/validation/IsStockExists.decorator";
import { QualityLevel } from "../enum/qualityLevel.enum";
import { Recycling } from "../enum/recycling.enum";
import { ItemName } from "../enum/itemName.enum";
import AddType from "../../../common/base/decorator/AddType.decorator";

@AddType('UpdateItemDto')
export class UpdateItemDto {
    @IsItemExists()
    @IsMongoId()
    _id: string;

    @IsString()
    @IsOptional()
    name: ItemName;

    @IsInt()
    @IsOptional()
    weight: number;

    @IsEnum(Recycling)
    @IsOptional()
    recycling: Recycling;

    @IsEnum(QualityLevel)
    @IsOptional()
    qualityLevel: QualityLevel;

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
    isFurniture: boolean;

    @IsStockExists()
    @IsMongoId()
    @IsOptional()
    stock_id: string;

    @IsMongoId()
    @IsOptional()
    room_id: string;
}