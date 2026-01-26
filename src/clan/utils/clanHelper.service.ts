import { Injectable } from '@nestjs/common';
import {
  getStockDefaultItems,
  getRoomDefaultItems,
} from './defaultValues/items';
import ServiceError from '../../common/service/basicService/ServiceError';
import { StockService } from '../../clanInventory/stock/stock.service';
import { SoulHomeService } from '../../clanInventory/soulhome/soulhome.service';
import { RoomService } from '../../clanInventory/room/room.service';
import { ItemService } from '../../clanInventory/item/item.service';
import { CreateRoomDto } from '../../clanInventory/room/dto/createRoom.dto';
import { StockDto } from '../../clanInventory/stock/dto/stock.dto';
import { ItemDto } from '../../clanInventory/item/dto/item.dto';
import { SoulHomeDto } from '../../clanInventory/soulhome/dto/soulhome.dto';
import { RoomDto } from '../../clanInventory/room/dto/room.dto';
import { SoulHome } from '../../clanInventory/soulhome/soulhome.schema';
import { ClientSession } from 'mongoose';

@Injectable()
export default class ClanHelperService {
  constructor(
    private readonly stockService: StockService,
    private readonly soulHomeService: SoulHomeService,
    private readonly roomService: RoomService,
    private readonly itemService: ItemService,
  ) {}

  /**
   * Creates a default Stock for the specified Clan.
   * @param clan_id _id of the Clan
   * @param session optional session for transaction support
   */
  async createDefaultStock(
    clan_id: string,
    session?: ClientSession, // Added session
  ): Promise<
    [{ Stock: StockDto; Item: ItemDto[] } | null, ServiceError[] | null]
  > {
    // Pass session in options object for BasicService compatibility inside StockService
    const [stock, stockErrors] = await this.stockService.createOne(
      { cellCount: 20, clan_id },
      { session },
    );
    if (stockErrors || !stock) return [null, stockErrors];

    const [items, itemsErrors] = await this.itemService.createMany(
      getStockDefaultItems(stock._id),
      { session },
    );
    if (itemsErrors || !items) return [null, itemsErrors];

    return [{ Stock: stock, Item: items }, null];
  }

  /**
   * Creates a default SoulHome for the specified Clan.
   * @param clan_id _id of the Clan
   * @param name name of the SoulHome
   * @param roomsCount default 30
   * @param session optional session for transaction support
   */
  async createDefaultSoulHome(
    clan_id: string,
    name: string,
    roomsCount = 30,
    session?: ClientSession, // Appended to avoid positional conflict with roomsCount
  ): Promise<
    [
      { SoulHome: SoulHomeDto; Room: RoomDto[]; Item: ItemDto[] } | null,
      ServiceError[] | null,
    ]
  > {
    const [soulHome, soulHomeErrors] =
      await this.soulHomeService.basicService.createOne<
        Partial<SoulHome>,
        SoulHomeDto
      >({ name, clan_id }, { session });
    if (soulHomeErrors || !soulHome) return [null, soulHomeErrors];

    const defaultRooms = this.getDefaultRooms(soulHome._id, roomsCount);
    const [rooms, roomsErrors] = await this.roomService.createMany(
      defaultRooms,
      { session },
    );
    if (roomsErrors || !rooms) return [null, roomsErrors];

    const firstRoom = rooms[0];

    const [items, itemsErrors] = await this.itemService.createMany(
      getRoomDefaultItems(firstRoom._id),
      { session },
    );
    if (itemsErrors || !items) return [null, itemsErrors];

    return [{ SoulHome: soulHome, Room: rooms, Item: items }, null];
  }

  private getDefaultRooms(soulHome_id: string, count: number) {
    const defaultRooms: CreateRoomDto[] = [];
    const defaultRoom: CreateRoomDto = {
      floorType: 'default',
      wallType: 'default',
      hasLift: false,
      cellCount: 10,
      soulHome_id,
    };
    for (let i = 0, l = count; i < l; i++) defaultRooms.push(defaultRoom);
    return defaultRooms;
  }
}
