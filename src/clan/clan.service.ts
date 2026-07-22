import { CreateClanDto } from './dto/createClan.dto';
import { UpdateClanDto } from './dto/updateClan.dto';
import { deleteNotUniqueArrayElements } from '../common/function/deleteNotUniqueArrayElements';
import { deleteArrayElements } from '../common/function/deleteArrayElements';
import { PlayerDto } from '../player/dto/player.dto';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Clan, publicReferences } from './clan.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
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
  initializeSession,
} from '../common/function/Transactions';
import { ClientSession } from 'mongoose';
import { getRoomDefaultItems } from './utils/defaultValues/items';

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
    @InjectConnection() private readonly connection: Connection,
    private readonly passwordGenerator: PasswordGenerator,
    private readonly stockService: StockService,
    @Inject(forwardRef(() => SoulHomeService))
    private readonly soulhomeService: SoulHomeService,
    private readonly clanHelperService: ClanHelperService,
    private readonly emitter: GameEventEmitter,
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
   * @returns created clan or ServiceErrors if any occurred
   */

  public async createOne(
    clanToCreate: CreateClanDto,
    player_id: string,
  ): Promise<IServiceReturn<ClanDto>> {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    if (clanToCreate && !clanToCreate.isOpen && !clanToCreate.password) {
      clanToCreate.password = this.passwordGenerator.generatePassword('fi');
    }

    let furnitureTotalValue = 0;
    for (const item of getRoomDefaultItems('')) {
      furnitureTotalValue += item.price;
    }

    const [clan, clanErrors] = await this.basicService.createOne<any, ClanDto>(
      { ...clanToCreate, furnitureTotalValue, admin_ids: [player_id] },
      { session },
    );
    if (clanErrors) return await cancelTransaction(session, clanErrors);

    const leaderRole = clan.roles.find(
      (role) => role.name === LeaderClanRole.name,
    );

    const [, playerErrors] = await this.playerService.updateOneById(
      player_id,
      { clan_id: clan._id, clanRole_id: leaderRole._id },
      { session },
    );
    if (playerErrors) return await cancelTransaction(session, playerErrors);

    const [stock, stockErrors] =
      await this.clanHelperService.createDefaultStock(clan._id, session);
    if (stockErrors) return await cancelTransaction(session, stockErrors);

    const [soulHome, soulHomeErrors] =
      await this.clanHelperService.createDefaultSoulHome(
        clan._id,
        clan.name,
        session,
      );
    if (soulHomeErrors) return await cancelTransaction(session, soulHomeErrors);

    clan.SoulHome = soulHome.SoulHome;
    clan.Stock = stock.Stock;

    const [result, commitError] = await endTransaction<ClanDto>(session, clan);
    if (commitError) return [null, commitError];

    this.emitter.emitAsync('clan.create', { clan_id: clan._id });

    return [result, null];
  }

  /**
   * Crete a new Clan with other default objects without admin.
   *
   * The default objects are required on the game side.
   * These objects are a Stock with its Items given to each new Clan, as well as a SoulHome with one Room
   * @param clanToCreate clan data
   * @returns created clan or ServiceErrors if any occurred
   */
  public async createOneWithoutAdmin(
    clanToCreate: CreateClanDto,
  ): Promise<IServiceReturn<CreateWithoutDtoType>> {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    if (clanToCreate && !clanToCreate.isOpen && !clanToCreate.password) {
      clanToCreate.password = this.passwordGenerator.generatePassword('fi');
    }

    let furnitureTotalValue = 0;
    for (const item of getRoomDefaultItems('')) {
      furnitureTotalValue += item.price;
    }

    const [clan, clanErrors] = await this.basicService.createOne(
      { ...clanToCreate, furnitureTotalValue, playerCount: 0 },
      { session },
    );
    if (clanErrors) return await cancelTransaction(session, clanErrors);

    const [stock, stockErrors] =
      await this.clanHelperService.createDefaultStock(clan._id, session);
    if (stockErrors) return await cancelTransaction(session, stockErrors);

    const [soulHome, soulHomeErrors] =
      await this.clanHelperService.createDefaultSoulHome(
        clan._id,
        clan.name,
        session,
      );
    if (soulHomeErrors) return await cancelTransaction(session, soulHomeErrors);

    clan.soulHome = soulHome.SoulHome;
    clan.rooms = soulHome.Room;
    clan.soulHomeItems = soulHome.Item;
    clan.stock = stock.Stock;
    clan.stockItems = stock.Item;

    const [result, commitError] = await endTransaction<CreateWithoutDtoType>(
      session,
      clan,
    );
    if (commitError) return [null, commitError];

    return [result, null];
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
   * @returns _true_ if update went successfully or array
   * of ServiceErrors if something went wrong
   */
  public async updateOneById(
    clanToUpdate: UpdateClanDto,
  ): Promise<[boolean | null, ServiceError[] | null]> {
    const { _id, admin_idsToDelete, admin_idsToAdd, ...fieldsToUpdate } =
      clanToUpdate;

    if (!admin_idsToAdd && !admin_idsToDelete)
      return this.basicService.updateOneById(_id, fieldsToUpdate);

    const [clan, clanErrors] =
      await this.basicService.readOneById<ClanDto>(_id);
    if (clanErrors || !clan) return [null, clanErrors];

    let admin_ids: string[] = clan.admin_ids;

    if (admin_idsToDelete)
      admin_ids = deleteArrayElements(admin_ids, admin_idsToDelete);

    if (admin_idsToAdd) {
      const idsToAdd = deleteNotUniqueArrayElements(admin_idsToAdd);
      admin_ids = admin_ids ? [...admin_ids, ...idsToAdd] : idsToAdd;
      admin_ids = deleteNotUniqueArrayElements(admin_ids);
    }

    if (admin_ids.length === 0)
      return [
        null,
        [
          new ServiceError({
            message:
              'Clan can not be without at least one admin. You are trying to delete all clan admins',
            field: 'admin_ids',
            reason: SEReason.REQUIRED,
          }),
        ],
      ];

    const playersInClan: string[] = [];
    for (const player_id of admin_ids) {
      const [player, playerErrors] =
        await this.playerService.readOneById<PlayerDto>(player_id);
      if (playerErrors || !player || !player.clan_id) continue;

      const parsedPlayerClan_id = player.clan_id.toString();
      const parsed_id = _id.toString();

      if (parsedPlayerClan_id === parsed_id) playersInClan.push(player_id);
    }

    if (playersInClan.length === 0)
      return [
        null,
        [
          new ServiceError({
            message:
              'Clan can not be without at least one admin. You are trying to delete all clan admins',
            field: 'admin_ids',
            reason: SEReason.REQUIRED,
          }),
        ],
      ];

    return await this.basicService.updateOneById(_id, {
      ...fieldsToUpdate,
      admin_ids: playersInClan,
    });
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
   * @param extSession - Optional external ClientSession.
   * @returns _true_ if Clan was removed successfully,
   * or a ServiceError array if the Clan was not found or something else went wrong
   */
  async deleteOneById(
    _id: string,
    extSession?: ClientSession 
  ): Promise<[true | null, ServiceError[] | null]> {
    const externalSession = extSession;
    const [session, initErrors] = 
      externalSession ? [ externalSession, null] : await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    const ownsTransaction = !externalSession;

    try {
      const [clan, clanErrors] = await this.basicService.readOneById<ClanDto>(
        _id,
        { 
          includeRefs: [ModelName.SOULHOME, ModelName.STOCK, ModelName.PLAYER], 
          session 
        },
      );
      if (clanErrors || !clan) {
        if (ownsTransaction) {
          return await cancelTransaction(session, clanErrors);
        }

        return [null, clanErrors];
      }

      if (clan.Player) {
        for (const player of clan.Player) {
          const [, upErrors] = await this.playerService.updateOneById(
            player._id,
            { clan_id: null },
            { session },
          );
          if (upErrors) {
            if (ownsTransaction) {
              return await cancelTransaction(session, upErrors);
            }
            return [null, upErrors];
          }
        }
      }

      if (clan.Stock) {
        const [, stockDelErrors] = await this.stockService.deleteOneById(
          clan.Stock._id,
          { session },
        );
        if (stockDelErrors) {
          if (ownsTransaction) {
            return await cancelTransaction(session, stockDelErrors);
          }
          return [null, stockDelErrors];
        }
      }

      if (clan.SoulHome) {
        const [, shDelErrors] = await this.soulhomeService.deleteOneById(
          clan.SoulHome._id,
          { session },
        );
        if (shDelErrors) {
          if (ownsTransaction) {
            return await cancelTransaction(session, shDelErrors);
          }
          return [null, shDelErrors];
        }
      }

      const [, deleteErrors] = await this.basicService.deleteOneById(_id, {
        session,
      });
      if (deleteErrors) {
        if (ownsTransaction) {
          return await cancelTransaction(session, deleteErrors);
        }
        return [null, deleteErrors];
      }

      if (ownsTransaction) {
        return await endTransaction(session, true);
      }

      return [true, null];
    } catch (error) {
      if (ownsTransaction) {
        return await cancelTransaction(session, [
          new ServiceError(error)
        ]);
      }
      throw error;
    }
  }
}
