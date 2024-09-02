import { Injectable } from "@nestjs/common";
import { StockService } from "../../stock/stock.service";
import { SoulHomeService } from "../../soulhome/soulhome.service";
import { ItemService } from "../../item/item.service";
import ServiceError, { isServiceError } from "../../common/service/basicService/ServiceError";
import { StockDto } from "../../stock/dto/stock.dto";
import { getStockDefaultItems, getRoomDefaultItems } from "./defaultValues/items";
import { RoomService } from "../../room/room.service";
import { SoulHomeDto } from "../../soulhome/dto/soulhome.dto";
import { CreateRoomDto } from "../../room/dto/createRoom.dto";
import { RoomDto } from "../../room/dto/room.dto";
import { ItemDto } from "../../item/dto/item.dto";

@Injectable()
export default class ClanHelperService {
    constructor(
        private readonly stockService: StockService,
        private readonly soulHomeService: SoulHomeService,
        private readonly roomService: RoomService,
        private readonly itemService: ItemService
    ) {
        
    }

    /**
     * Creates a default Stock for the specified Clan.
     *
     * The default Stock will contain multiple default Items inside.
     *
     * @param clan_id _id of the Clan for which Stock should be created
     *
     * @returns created _Stock_ and its _items_, or array of ServiceErrors if something went wrong 
     */
    async createDefaultStock(clan_id: string){
        const stockResp = await this.stockService.createOne({cellCount: 20, clan_id});

        if(isServiceError(stockResp))
            return stockResp as ServiceError[];

        const stock = stockResp as StockDto;

        const itemsResp = await this.itemService.createMany(getStockDefaultItems(stock._id));
        if(isServiceError(itemsResp))
            return itemsResp as ServiceError[];

        const items = itemsResp as ItemDto[];

        return {
            Stock: stock,
            Item: items
        }
    }

    /**
     * Creates a default SoulHome for the specified Clan.
     *
     * The default SoulHome will contain 30 Rooms 
     * as well as the first Room will have multiple default Items inside
     *
     * @param clan_id _id of the Clan for which SoulHome should be created
     * @param name name of the SoulHome to be created
     * @param roomsCount how much rooms need to be created, 30 is default
     *
     * @returns created _SoulHome_, _Rooms_ and _Items_, or array of ServiceErrors if something went wrong 
     */
    async createDefaultSoulHome(clan_id: string, name: string, roomsCount: number = 30){
        const soulHomeResp = await this.soulHomeService.createOne({name, clan_id});
        if(isServiceError(soulHomeResp))
            return soulHomeResp as ServiceError[];

        const soulHome = soulHomeResp as SoulHomeDto;
   
        const defaultRooms = this.getDefaultRooms(soulHome._id, roomsCount);
        const roomsResp = await this.roomService.createMany(defaultRooms);
        if(isServiceError(roomsResp))
            return roomsResp as ServiceError[];

        const rooms = roomsResp as RoomDto[];

        const firstRoom = rooms[0];

        const itemsResp = await this.itemService.createMany(getRoomDefaultItems(firstRoom._id));
        if(isServiceError(itemsResp))
            return itemsResp as ServiceError[];

        const items = itemsResp as ItemDto[];

        return {
            SoulHome: soulHome,
            Room: rooms,
            Item: items
        };
    }

    /**
     * Generate array of default Rooms belonging to the specified SoulHome.
     *
     * @param soulHome_id _id of SoulHome to which Rooms will belong to
     * @param count Amount of Rooms to generate
     */
    private getDefaultRooms(soulHome_id: string, count: number){
        const defaultRooms: CreateRoomDto[] = [];
        const defaultRoom: CreateRoomDto = {
            floorType: "default",
            wallType: "default",
            hasLift: false,
            cellCount: 10,
            soulHome_id
        }
        for(let i=0, l=count; i<l; i++)
            defaultRooms.push(defaultRoom);

        return defaultRooms;
    }
}