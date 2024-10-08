import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {StockDto} from "../../stock/dto/stock.dto";
import {RoomDto} from "../../room/dto/room.dto";
import AddType from "../../common/base/decorator/AddType.decorator";
import { Recycling } from "../enum/recycling.enum";

@AddType('ItemDto')
export class ItemDto {
    @ExtractField()
    @Expose()
    _id: string;

    @Expose()
    name: string;

    @Expose()
    weight: number;

    @Expose()
    recycling: Recycling;

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