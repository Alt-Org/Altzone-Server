import {
    IsBoolean,
    IsInt,
    IsMongoId,
    IsOptional,
    IsString,
    IsArray,
    IsEnum,
    ArrayMinSize,
    ArrayMaxSize
} from "class-validator";
import {IsStockExists} from "../../stock/decorator/validation/IsStockExists.decorator";
import { QualityLevel } from "../enum/qualityLevel.enum";
import { Recycling } from "../enum/recycling.enum";
import { ItemName } from "../enum/itemName.enum";
import AddType from "../../../common/base/decorator/AddType.decorator";

@AddType('CreateItemDto')
export class CreateItemDto {
    @IsString()
    name: ItemName;

    @IsInt()
    weight: number;

    @IsEnum(Recycling)
    recycling: Recycling;

    @IsEnum(QualityLevel)
    qualityLevel: QualityLevel;

    @IsString()
    unityKey: string;

    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
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