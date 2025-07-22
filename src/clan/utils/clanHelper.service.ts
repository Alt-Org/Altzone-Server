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
   *
   * The default Stock will contain multiple default Items inside.
   *
   * @param clan_id _id of the Clan for which Stock should be created
   *
   * @returns created _Stock_ and its _items_, or array of ServiceErrors if something went wrong
   */
  async createDefaultStock(
    clan_id: string,
  ): Promise<
    [{ Stock: StockDto; Item: ItemDto[] } | null, ServiceError[] | null]
  > {
    const [stock, stockErrors] = await this.stockService.createOne({
      cellCount: 20,
      clan_id,
    });
    if (stockErrors || !stock) return [null, stockErrors];

    const [items, itemsErrors] = await this.itemService.createMany(
      getStockDefaultItems(stock._id),
    );
    if (itemsErrors || !items) return [null, itemsErrors];

    return [
      {
        Stock: stock,
        Item: items,
      },
      null,
    ];
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
  async createDefaultSoulHome(
    clan_id: string,
    name: string,
    roomsCount = 30,
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
      >({
        name,
        clan_id,
      });
    if (soulHomeErrors || !soulHome) return [null, soulHomeErrors];

    const defaultRooms = this.getDefaultRooms(soulHome._id, roomsCount);
    const [rooms, roomsErrors] =
      await this.roomService.createMany(defaultRooms);
    if (roomsErrors || !rooms) return [null, roomsErrors];

    const firstRoom = rooms[0];

    const [items, itemsErrors] = await this.itemService.createMany(
      getRoomDefaultItems(firstRoom._id),
    );
    if (itemsErrors || !items) return [null, itemsErrors];

    return [
      {
        SoulHome: soulHome,
        Room: rooms,
        Item: items,
      },
      null,
    ];
  }

  /**
   * Generate array of default Rooms belonging to the specified SoulHome.
   *
   * @param soulHome_id _id of SoulHome to which Rooms will belong to
   * @param count Amount of Rooms to generate
   */
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
