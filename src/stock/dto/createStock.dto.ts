import {IsEnum, IsInt, IsMongoId} from "class-validator";
import {IsClanExists} from "../../clan/decorator/validation/IsClanExists.decorator";
import {StockType} from "../../common/enum/stockType.enum";
import AddType from "../../common/base/decorator/AddType.decorator";

@AddType('CreateStockDto')
export class CreateStockDto {
    @IsEnum(StockType)
    @IsInt()
    type: StockType;

    @IsInt()
    rowCount: number;

    @IsInt()
    columnCount: number;

    @IsClanExists()
    @IsMongoId()
    clan_id: string;
}