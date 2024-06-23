import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {ClanDto} from "../../clan/dto/clan.dto";
import {StockDto} from "../../stock/dto/stock.dto";
import AddType from "src/common/base/decorator/AddType.decorator";

@AddType('ItemDto')
export class ItemDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    name: string;

    @Expose()
    shape: string;

    @Expose()
    weight: number;

    @Expose()
    material: string;

    @Expose()
    recycling: string;

    @Expose()
    unityKey: string;

    @Expose()
    filename: string;

    @Expose()
    rowNumber: number;

    @Expose()
    columnNumber: number;

    @Expose()
    isInStock: boolean;

    @Expose()
    isFurniture: boolean;

    @ExtractField()
    @Expose()
    stock_id: string;

    @Type(() => StockDto)
    @Expose()
    Stock: StockDto;
}