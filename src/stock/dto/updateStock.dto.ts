import {IsEnum, IsInt, IsMongoId, IsOptional} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {StockType} from "../../common/enum/stockType.enum";
import {IsStockExists} from "../decorator/validation/IsStockExists.decorator";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('UpdateStockDto')
export class UpdateStockDto {
    @IsStockExists()
    @IsMongoId()
    _id: string;

    @IsEnum(StockType)
    @IsOptional()
    type: StockType;

    @IsInt()
    @IsOptional()
    rowCount: number;

    @IsInt()
    @IsOptional()
    columnCount: number;

    @IsClanExists()
    @IsMongoId()
    @IsOptional()
    clan_id: string;
}