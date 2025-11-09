import { CreateClanDto } from './dto/createClan.dto';
import { UpdateClanDto } from './dto/updateClan.dto';
import { deleteNotUniqueArrayElements } from '../common/function/deleteNotUniqueArrayElements';
import { deleteArrayElements } from '../common/function/deleteArrayElements';
import { PlayerDto } from '../player/dto/player.dto';
import { Injectable } from '@nestjs/common';
import { Clan, publicReferences } from './clan.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import { ClanDto } from './dto/clan.dto';
import BasicService from '../common/service/basicService/BasicService';
import ServiceError from '../common/service/basicService/ServiceError';
import { Player } from '../player/schemas/player.schema';
import ClanHelperService from './utils/clanHelper.service';
import { SEReason } from '../common/service/basicService/SEReason';
import {
  IServiceReturn,
  TIServiceReadManyOptions,
  TIServiceUpdateOneOptions,
  TReadByIdOptions,
} from '../common/service/basicService/IService';
import { ModelName } from '../common/enum/modelName.enum';
import { StockService } from '../clanInventory/stock/stock.service';
import { SoulHomeService } from '../clanInventory/soulhome/soulhome.service';
import GameEventEmitter from '../gameEventsEmitter/gameEventEmitter';
import { LeaderClanRole } from './role/initializationClanRoles';
import { PasswordGenerator } from '../common/function/passwordGenerator';
import { SoulHome } from '../clanInventory/soulhome/soulhome.schema';
import { Stock } from '../clanInventory/stock/stock.schema';
import { Room } from '../clanInventory/room/room.schema';
import { Item } from '../clanInventory/item/item.schema';
import {
  cancelTransaction,
  endTransaction,
  InitializeSession,
} from '../common/function/Transactions';

type CreateWithoutDtoType = Clan & {
  soulHome: SoulHome;
  rooms: Room[];
  soulHomeItems: Item[];
  stock: Stock;
  stockItems: Item[];
};

@Injectable()
export class ClanService {
  public constructor(
    @InjectModel(Clan.name) public readonly model: Model<Clan>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    private readonly passwordGenerator: PasswordGenerator,
    private readonly stockService: StockService,
    private readonly soulhomeService: SoulHomeService,
    private readonly clanHelperService: ClanHelperService,
    private readonly emitter: GameEventEmitter,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.basicService = new BasicService(model);
    this.playerService = new BasicService(playerModel);
  }
  public readonly basicService: BasicService;
  public readonly playerService: BasicService;

  /**
   * Crete a new Clan with other default objects.
   *
   * The default objects are required on the game side.
   * These objects are a Stock with its Items given to each new Clan, as well as a SoulHome with one Room
   * @param clanToCreate
   * @param player_id the player_id of the Clan creator, and who is also will be the admin of the Clan
   * @param openedSession - (Optional) An already opened ClientSession to use
   * @returns created clan or ServiceErrors if any occurred
   */
  public async createOne(
    clanToCreate: CreateClanDto,
    player_id: string,
    openedSession?: ClientSession,
  ): Promise<IServiceReturn<ClanDto>> {
    if (clanToCreate && !clanToCreate.isOpen && !clanToCreate.password) {
      clanToCreate.password = this.passwordGenerator.generatePassword('fi');
    }
    const clanWithAdmin = { ...clanToCreate, admin_ids: [player_id] };
    const session = await InitializeSession(this.connection, openedSession);
    const [clan, clanErrors] = await this.basicService.createOne<any, ClanDto>(
      clanWithAdmin,
    );
    if (clanErrors || !clan)
      return await cancelTransaction(session, clanErrors, openedSession);

    const leaderRole = clan.roles.find(
      (role) => role.name === LeaderClanRole.name,
    );

    const [, playerErrors] = await this.playerService.updateOneById(player_id, {
      clan_id: clan._id,
      clanRole_id: leaderRole._id,
    });
    if (playerErrors) return await cancelTransaction(session, playerErrors, openedSession);

    const [stock, stockErrors] =
      await this.clanHelperService.createDefaultStock(clan._id);
    if (stockErrors || !stock)
      return await cancelTransaction(session, stockErrors, openedSession);

    const [soulHome, soulHomeErrors] =
      await this.clanHelperService.createDefaultSoulHome(clan._id, clan.name, 30, session);
    if (soulHomeErrors || !soulHome)
      return await cancelTransaction(session, soulHomeErrors, openedSession);

    clan.SoulHome = soulHome.SoulHome;
    clan.Stock = stock.Stock;

    this.emitter.emitAsync('clan.create', { clan_id: clan._id });

    return await endTransaction(session, clan, openedSession);
  }

  /**
   * Crete a new Clan with other default objects without admin.
   *
   * The default objects are required on the game side.
   * These objects are a Stock with its Items given to each new Clan, as well as a SoulHome with one Room
   * @param clanToCreate clan data
   * @param openedSession - (Optional) An already opened ClientSession to use
   * @returns created clan or ServiceErrors if any occurred
   */
  public async createOneWithoutAdmin(
    clanToCreate: CreateClanDto,
    openedSession?: ClientSession,
  ): Promise<IServiceReturn<CreateWithoutDtoType>> {
    if (clanToCreate && !clanToCreate.isOpen && !clanToCreate.password) {
      clanToCreate.password = this.passwordGenerator.generatePassword('fi');
    }

    const session = await InitializeSession(this.connection, openedSession);
    const [clan, clanErrors] = await this.basicService.createOne({
      ...clanToCreate,
      playerCount: 0,
    });
    if (clanErrors || !clan)
      return await cancelTransaction(session, clanErrors, openedSession);

    const [stock, stockErrors] =
      await this.clanHelperService.createDefaultStock(clan._id, session);
    if (stockErrors || !stock)
      return await cancelTransaction(session, stockErrors, openedSession);

    const [soulHome, soulHomeErrors] =
      await this.clanHelperService.createDefaultSoulHome(clan._id, clan.name, 30, session);
    if (soulHomeErrors || !soulHome)
      return await cancelTransaction(session, soulHomeErrors, openedSession);

    clan.soulHome = soulHome.SoulHome;
    clan.rooms = soulHome.Room;
    clan.soulHomeItems = soulHome.Item;
    clan.stock = stock.Stock;
    clan.stockItems = stock.Item;

    return await endTransaction(session, clan, openedSession);
  }

  /**
   * Reads a Clan by its _id in DB.
   *
   * @param _id - The Mongo _id of the Clan to read.
   * @param options - Options for reading the Clan.
   * @returns Clan with the given _id on succeed or an array of ServiceErrors if any occurred.
   */
  async readOneById(_id: string, options?: TReadByIdOptions) {
    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        publicReferences.includes(ref),
      );

    return this.basicService.readOneById<ClanDto>(_id, optionsToApply);
  }

  /**
   * Reads all Clans based on the provided options.
   *
   * @param options - Options for reading Clans.
   * @returns An array of Clans if succeeded or an array of ServiceErrors if error occurred.
   */
  async readAll(options?: TIServiceReadManyOptions) {
    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        publicReferences.includes(ref),
      );

    return this.basicService.readMany<ClanDto>(optionsToApply);
  }

  /**
   * Updates the specified Clan data in DB
   *
   * @param clanToUpdate object with fields to be updated
   * @param openedSession - (Optional) An already opened ClientSession to use
   * @returns _true_ if update went successfully or array
   * of ServiceErrors if something went wrong
   */
  public async updateOneById(
    clanToUpdate: UpdateClanDto,
    openedSession?: ClientSession,
  ): Promise<[boolean | null, ServiceError[] | null]> {
    const { _id, admin_idsToDelete, admin_idsToAdd, ...fieldsToUpdate } =
      clanToUpdate;

    const session = await InitializeSession(this.connection, openedSession);

    if (!admin_idsToAdd && !admin_idsToDelete)
      return this.basicService.updateOneById(_id, fieldsToUpdate);

    const [clan, clanErrors] =
      await this.basicService.readOneById<ClanDto>(_id);
    if (clanErrors || !clan)
      return await cancelTransaction(session, clanErrors, openedSession);

    let admin_ids: string[] = clan.admin_ids;

    if (admin_idsToDelete)
      admin_ids = deleteArrayElements(admin_ids, admin_idsToDelete);

    if (admin_idsToAdd) {
      const idsToAdd = deleteNotUniqueArrayElements(admin_idsToAdd);
      admin_ids = admin_ids ? [...admin_ids, ...idsToAdd] : idsToAdd;
      admin_ids = deleteNotUniqueArrayElements(admin_ids);
    }

    if (admin_ids.length === 0)
      return await cancelTransaction(session, [
        new ServiceError({
          message:
            'Clan can not be without at least one admin. You are trying to delete all clan admins',
          field: 'admin_ids',
          reason: SEReason.REQUIRED,
        }),
      ], openedSession);

    //add only players that are clan members
    const playersInClan: string[] = [];
    const playersNotInClan: string[] = [];
    for (let i = 0; i < admin_ids.length; i++) {
      const player_id = admin_ids[i];
      const [player, playerErrors] =
        await this.playerService.readOneById<PlayerDto>(player_id);
      if (playerErrors || !player || !player.clan_id) continue;

      let parsedPlayerClan_id = player.clan_id;
      if (typeof parsedPlayerClan_id !== 'string')
        parsedPlayerClan_id = player.clan_id.toString();

      let parsed_id = _id;
      if (typeof parsed_id !== 'string') parsed_id = _id.toString();

      if (parsedPlayerClan_id === parsed_id) {
        playersInClan.push(player_id);
      } else {
        playersNotInClan.push(player_id);
      }
    }

    if (playersInClan.length === 0)
      return await cancelTransaction(session, [
        new ServiceError({
          message:
            'Clan can not be without at least one admin. You are trying to delete all clan admins',
          field: 'admin_ids',
          reason: SEReason.REQUIRED,
        }),
      ], openedSession);

    const [_, errors] = await this.basicService.updateOneById(_id, {
      ...fieldsToUpdate,
      admin_ids: playersInClan,
    });

    if (errors) return await cancelTransaction(session, errors, openedSession);

    return await endTransaction(session, openedSession);
  }

  /**
   * Updates one clan data
   * @param updateInfo data to update
   * @param options required options of the query
   * @returns tuple in form [ isSuccess, errors ]
   */
  async updateOne(
    updateInfo: Partial<Clan>,
    options: TIServiceUpdateOneOptions,
  ) {
    return this.basicService.updateOne(updateInfo, options);
  }

  /**
   * Deletes a Clan by its _id from DB.
   *
   * Notice that the method will also delete Clan's SoulHome and Stock as well.
   * Also all Players, which were members of the Clan will be excluded.
   *
   * @param _id - The Mongo _id of the Clan to delete.
   * @param openedSession - (Optional) An already opened ClientSession to use
   * 
   * @returns _true_ if Clan was removed successfully,
   * or a ServiceError array if the Clan was not found or something else went wrong
   */
  async deleteOneById(
    _id: string,
    openedSession?: ClientSession,
  ): Promise<[true | null, ServiceError[] | null]> {
    const session = await InitializeSession(this.connection, openedSession);
    const [clan, clanErrors] = await this.basicService.readOneById<ClanDto>(
      _id,
      { includeRefs: [ModelName.SOULHOME, ModelName.STOCK, ModelName.PLAYER] },
    );
    if (clanErrors || !clan)
      return await cancelTransaction(session, clanErrors, openedSession);

    try {
      if (clan.Player) {
        for (let i = 0, l = clan.Player.length; i < l; i++) {
          const player = clan.Player[i];
          await this.playerService.updateOneById(player._id, { clan_id: null });
        }
      }

      if (clan.Stock) await this.stockService.deleteOneById(clan.Stock._id, session);
      if (clan.SoulHome)
        await this.soulhomeService.deleteOneById(clan.SoulHome._id, session);

      await this.basicService.deleteOneById(_id);
    } catch (error) {
      return await cancelTransaction(session, error as ServiceError[], openedSession);
    }

    return await endTransaction(session, openedSession);
  }
}
