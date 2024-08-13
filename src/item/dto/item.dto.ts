import {Expose, Type} from "class-transformer";
import {ExtractField} from "../../common/decorator/response/ExtractField";
import {ClanDto} from "../../clan/dto/clan.dto";
import {StockDto} from "../../stock/dto/stock.dto";
import {RoomDto} from "../../Room/dto/room.dto";
import AddType from "src/common/base/decorator/AddType.decorator";
import { recycling } from "src/common/enum/recycling.enum";

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
    recycling: recycling;

    @Expose()
    unityKey: string;

    @Expose()
    price: number;

    @Expose()
    location: Array<number>;
   
    @Expose()
    isFurniture: boolean;

    //@Expose()
    //isInStock: boolean;

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