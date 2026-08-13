import { Injectable, Inject, forwardRef } from '@nestjs/common';
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
import { ClientSession, Model } from 'mongoose';
import { Clan } from '../clan.schema';
import { InjectModel } from '@nestjs/mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { Environment } from '../../common/enum/environment.enum';

@Injectable()
export default class ClanHelperService {
  constructor(
    @InjectModel(Clan.name)
    private readonly clanModel: Model<Clan>,
    @Inject(forwardRef(() => StockService))
    private readonly stockService: StockService,
    @Inject(forwardRef(() => SoulHomeService))
    private readonly soulHomeService: SoulHomeService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    private readonly itemService: ItemService,
  ) {
    this.basicService = new BasicService(clanModel);
  }

  private readonly basicService: BasicService;

  /**
   * Creates a default Stock for the specified Clan.
   * @param clan_id _id of the Clan
   * @param session optional session for transaction support
   * @param environment environment of the Clan
   * @returns created _Stock_ and its _items_, or array of ServiceErrors if something went wrong
   */
  async createDefaultStock(
    clan_id: string,
    session?: ClientSession,
    environment?: Environment,
  ): Promise<
    [{ Stock: StockDto; Item: ItemDto[] } | null, ServiceError[] | null]
  > {
    if (environment === undefined) {
      const [clan, clanErrors] =
        await this.basicService.readOneById<Clan>(clan_id);
      if (clanErrors || !clan) {
        return [null, clanErrors];
      }
      environment = clan.environment ?? Environment.OPEN_DEMO;
    }

    const [stock, stockErrors] = await this.stockService.createOne(
      { cellCount: 20, clan_id, environment: environment },
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
   * @param environment environment of the Clan
   * @returns created _SoulHome_, _Rooms_ and _Items_, or array of ServiceErrors if something went wrong
   */
  async createDefaultSoulHome(
    clan_id: string,
    name: string,
    session?: ClientSession,
    environment?: Environment,
  ): Promise<
    [
      { SoulHome: SoulHomeDto; Room: RoomDto; Item: ItemDto[] } | null,
      ServiceError[] | null,
    ]
  > {
    if (environment === undefined) {
      const [clan, clanErrors] =
        await this.basicService.readOneById<Clan>(clan_id);
      if (clanErrors || !clan) {
        return [null, clanErrors];
      }
      environment = clan.environment ?? Environment.OPEN_DEMO;
    }

    const [soulHome, soulHomeErrors] =
      await this.soulHomeService.basicService.createOne<
        Partial<SoulHome>,
        SoulHomeDto
      >({ name, clan_id, environment: environment }, { session });
    if (soulHomeErrors || !soulHome) return [null, soulHomeErrors];

    const [defaultRoom, defaultRoomErrors] =
      await this.roomService.getSoulHomeRoom(clan_id, session);
    if (defaultRoomErrors) return [null, defaultRoomErrors];

    const [room, roomErrors] = await this.roomService.createOne(defaultRoom, {
      session,
    });
    if (roomErrors || !room) return [null, roomErrors];

    const [items, itemsErrors] = await this.itemService.createMany(
      getRoomDefaultItems(room._id),
      { session },
    );
    if (itemsErrors || !items) return [null, itemsErrors];

    return [{ SoulHome: soulHome, Room: room, Item: items }, null];
  }
}
