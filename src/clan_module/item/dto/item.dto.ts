import {Expose, Type} from "class-transformer";
import {StockDto} from "../../stock/dto/stock.dto";
import {RoomDto} from "../../room/dto/room.dto";
import { QualityLevel } from "../enum/qualityLevel.enum";
import { Recycling } from "../enum/recycling.enum";
import { ItemName } from "../enum/itemName.enum";
import AddType from "../../../common/base/decorator/AddType.decorator";
import { ExtractField } from "../../../common/decorator/response/ExtractField";

@AddType('ItemDto')
export class ItemDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    name: ItemName;

    @Expose()
    weight: number;

    @Expose()
    recycling: Recycling;

    @Expose()
    qualityLevel: QualityLevel;

    @Expose()
    unityKey: string;

    @Expose()
    price: number;

    @Expose()
    location: Array<number>;
   
    @Expose()
    isFurniture: boolean;

    @ExtractField()
    @Expose()
    stock_id: string;

    @Type(() => StockDto)
    @Expose()
    Stock: StockDto;

    @ExtractField()
    @Expose()
    room_id: string;

    @Type(() => RoomDto)
    @Expose()
    Room: RoomDto;
}