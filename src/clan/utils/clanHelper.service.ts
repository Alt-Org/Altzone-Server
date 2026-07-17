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
   * @returns created _Stock_ and its _items_, or array of ServiceErrors if something went wrong
   */
  async createDefaultStock(
    clan_id: string,
    session?: ClientSession,
  ): Promise<
    [{ Stock: StockDto; Item: ItemDto[] } | null, ServiceError[] | null]
  > {
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
   * @param session optional session for transaction support
   * @returns created _SoulHome_, _Rooms_ and _Items_, or array of ServiceErrors if something went wrong
   */
  async createDefaultSoulHome(
    clan_id: string,
    name: string,
    session?: ClientSession,
  ): Promise<
    [
      { SoulHome: SoulHomeDto; Room: RoomDto; Item: ItemDto[] } | null,
      ServiceError[] | null,
    ]
  > {
    const [soulHome, soulHomeErrors] =
      await this.soulHomeService.basicService.createOne<
        Partial<SoulHome>,
        SoulHomeDto
      >({ name, clan_id }, { session });
    if (soulHomeErrors || !soulHome) return [null, soulHomeErrors];

    const [defaultRoom, defaultRoomErrors] = await this.roomService.getSoulHomeRoom(
      clan_id,
      session
    );
    if (defaultRoomErrors) return [null, defaultRoomErrors];

    const [room, roomErrors] = await this.roomService.createOne(
      defaultRoom,
      { session },
    );
    if (roomErrors || !room) return [null, roomErrors];

    const [items, itemsErrors] = await this.itemService.createMany(
      getRoomDefaultItems(room._id),
      { session },
    );
    if (itemsErrors || !items) return [null, itemsErrors];

    return [{ SoulHome: soulHome, Room: room, Item: items }, null];
  }
}
