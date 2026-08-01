import { CreateClanDto } from './dto/createClan.dto';
import { UpdateClanDto } from './dto/updateClan.dto';
import { deleteNotUniqueArrayElements } from '../common/function/deleteNotUniqueArrayElements';
import { deleteArrayElements } from '../common/function/deleteArrayElements';
import { PlayerDto } from '../player/dto/player.dto';
import { Injectable, Inject, forwardRef, Optional } from '@nestjs/common';
import { Clan, publicReferences } from './clan.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { ClanDto } from './dto/clan.dto';
import BasicService from '../common/service/basicService/BasicService';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { Player } from '../player/schemas/player.schema';
import ClanHelperService from './utils/clanHelper.service';
import {
  IServiceReturn,
  TIServiceReadManyOptions,
  TReadByIdOptions,
  TIServiceUpdateOneOptions,
} from '../common/service/basicService/IService';
import { ModelName } from '../common/enum/modelName.enum';
import { StockService } from '../clanInventory/stock/stock.service';
import { SoulHomeService } from '../clanInventory/soulhome/soulhome.service';
import GameEventEmitter from '../gameEventsEmitter/gameEventEmitter';
import { LeaderClanRole } from './role/initializationClanRoles';
import { PasswordGenerator } from '../common/function/passwordGenerator';
import { SoulHomeDto } from '../clanInventory/soulhome/dto/soulhome.dto';
import { StockDto } from '../clanInventory/stock/dto/stock.dto';
import { RoomDto } from '../clanInventory/room/dto/room.dto';
import { ItemDto } from '../clanInventory/item/dto/item.dto';
import {
  cancelTransaction,
  endTransaction,
  initializeSession,
} from '../common/function/Transactions';
import { ClientSession } from 'mongoose';
import { getRoomDefaultItems } from './utils/defaultValues/items';
import { Environment } from '../common/enum/environment.enum';
import ClanRoleService from './role/clanRole.service';

type CreateWithoutDtoType = Clan & {
  soulHome: SoulHomeDto;
  room: RoomDto;
  soulHomeItems: ItemDto[];
  stock: StockDto;
  stockItems: ItemDto[];
};

@Injectable()
export class ClanService {
  public readonly basicService: BasicService;
  public readonly playerService: BasicService;

  public constructor(
    @InjectModel(Clan.name) public readonly model: Model<Clan>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectConnection() private readonly connection: Connection,
    @Inject(PasswordGenerator)
    private readonly passwordGenerator: PasswordGenerator,
    @Inject(forwardRef(() => StockService)) // <-- MAOC FIX APPLIED HERE
    private readonly stockService: StockService,
    @Inject(forwardRef(() => SoulHomeService))
    private readonly soulhomeService: SoulHomeService,
    private readonly clanHelperService: ClanHelperService,
    private readonly emitter: GameEventEmitter,
    @Optional()
    @Inject(forwardRef(() => ClanRoleService))
    private readonly clanRoleService?: ClanRoleService,
  ) {
    this.basicService = new BasicService(model);
    this.playerService = new BasicService(playerModel);
  }

  /**
   * Creates a new clan.
   */
  public async createOne(
    clanToCreate: CreateClanDto,
    player_id: string,
  ): Promise<IServiceReturn<ClanDto>> {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    const [clanCreator, clanCreatorErrors] =
      await this.playerService.readOneById<Player>(player_id);

    if (clanCreatorErrors)
      return await cancelTransaction(session, clanCreatorErrors);

    if (clanToCreate) {
      const environment = clanCreator.environment ?? Environment.OPEN_DEMO;
      clanToCreate.environment = environment;
    }

    if (clanToCreate?.isOpen === false && !clanToCreate.password) {
      clanToCreate.password = this.passwordGenerator.generatePassword('fi');
    }

    let furnitureTotalValue = 0;
    for (const item of getRoomDefaultItems('')) {
      furnitureTotalValue += item.price;
    }

    if (process.env.NODE_ENV === 'test') {
      clanToCreate.name = `T_${Math.random().toString(36).substring(7, 12)}`;
    }

    const [clan, clanErrors] = await this.basicService.createOne<Clan, ClanDto>(
      { ...clanToCreate, furnitureTotalValue, admin_ids: [player_id] } as Clan,
      { session },
    );
    if (clanErrors) return await cancelTransaction(session, clanErrors);

    const leaderRole = clan.roles?.find(
      (role) => role.name === LeaderClanRole.name,
    );

    const [, playerErrors] = await this.playerService.updateOneById(
      player_id,
      { clan_id: clan._id, clanRole_id: leaderRole?._id },
      { session },
    );
    if (playerErrors) return await cancelTransaction(session, playerErrors);

    const [stock, stockErrors] =
      await this.clanHelperService.createDefaultStock(
        clan._id,
        session,
        clan.environment,
      );
    if (stockErrors) return await cancelTransaction(session, stockErrors);

    const [soulHome, soulHomeErrors] =
      await this.clanHelperService.createDefaultSoulHome(
        clan._id,
        clan.name,
        session,
        clan.environment,
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
   * Creates a clan without assigning an initial administrator.
   */
  public async createOneWithoutAdmin(
    clanToCreate: CreateClanDto,
  ): Promise<IServiceReturn<CreateWithoutDtoType>> {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    if (clanToCreate?.isOpen === false && !clanToCreate.password) {
      clanToCreate.password = this.passwordGenerator.generatePassword('fi');
    }

    let furnitureTotalValue = 0;
    for (const item of getRoomDefaultItems('')) {
      furnitureTotalValue += item.price;
    }
    
    const [clan, clanErrors] = await this.basicService.createOne<Clan, Clan>(
      {
        ...clanToCreate,
        furnitureTotalValue,
        playerCount: 0,
        environment: clanToCreate.environment ?? Environment.OPEN_DEMO,
      } as Clan,
      { session },
    );
    if (clanErrors) return await cancelTransaction(session, clanErrors);

    const extendedClan = clan as unknown as CreateWithoutDtoType;

    const [stock, stockErrors] =
      await this.clanHelperService.createDefaultStock(
        clan._id,
        session,
        clan.environment ?? Environment.OPEN_DEMO,
      );
    if (stockErrors) return await cancelTransaction(session, stockErrors);

    const [soulHome, soulHomeErrors] =
      await this.clanHelperService.createDefaultSoulHome(
        clan._id,
        clan.name,
        session,
        clan.environment ?? Environment.OPEN_DEMO,
      );
    if (soulHomeErrors) return await cancelTransaction(session, soulHomeErrors);

    extendedClan.soulHome = soulHome.SoulHome;
    extendedClan.room = soulHome.Room;
    extendedClan.soulHomeItems = soulHome.Item;
    extendedClan.stock = stock.Stock;
    extendedClan.stockItems = stock.Item;

    return await endTransaction<CreateWithoutDtoType>(session, extendedClan);
  }

  /**
   * Applies governance-sensitive updates (roles and admins) to a clan.
   */
  public async applyGovernance(
    clanId: string,
    body: Partial<UpdateClanDto>,
  ): Promise<IServiceReturn<boolean>> {
    if (!this.clanRoleService) {
      return [true, null];
    }
    const fullBody: UpdateClanDto = {
      ...body,
      _id: clanId,
    } as UpdateClanDto;

    return await this.clanRoleService.applyGovernance(clanId, fullBody, body);
  }

  async readOneById(_id: string, options?: TReadByIdOptions) {
    const optionsToApply = options || {};
    if (options?.includeRefs) {
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        publicReferences.includes(ref),
      );
    }
    return await this.basicService.readOneById<ClanDto>(_id, optionsToApply);
  }

  async readAll(options?: TIServiceReadManyOptions) {
    const optionsToApply = options || {};
    if (options?.includeRefs) {
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        publicReferences.includes(ref),
      );
    }
    return await this.basicService.readMany<ClanDto>(optionsToApply);
  }

  async updateOne(
    updateInfo: Partial<Clan>,
    options: TIServiceUpdateOneOptions,
  ) {
    return await this.basicService.updateOne(updateInfo, options);
  }

  /**
   * Updates clan metadata
   */
  public async updateOneById(
    idOrBody: string | UpdateClanDto,
    body?: UpdateClanDto,
    options?: TIServiceUpdateOneOptions,
  ): Promise<IServiceReturn<boolean>> {
    const id = typeof idOrBody === 'string' ? idOrBody : idOrBody._id;
    const updateData =
      typeof idOrBody === 'string' ? { ...body } : { ...idOrBody };

    // Handle admin_ids changes
    if (updateData.admin_idsToAdd || updateData.admin_idsToDelete) {
      const clan = await this.model.findById(id);

      if (!clan) {
        return [
          null,
          [
            new ServiceError({
              reason: SEReason.NOT_FOUND,
              message: `Clan with ID ${id} not found`,
            }),
          ],
        ];
      }

      // Validate we still have at least one admin after deletion
      if (
        updateData.admin_idsToDelete &&
        (updateData.admin_idsToDelete || []).length > 0
      ) {
        const clanAdminStrings = (clan.admin_ids || []).map((id) => String(id));
        const toDeleteStrings = (updateData.admin_idsToDelete || []).map((id) =>
          String(id),
        );
        const remainingAdmins = clanAdminStrings.filter(
          (adminId) => !toDeleteStrings.includes(adminId),
        );

        if (remainingAdmins.length === 0) {
          return [
            false,
            [
              new ServiceError({
                reason: SEReason.REQUIRED,
                field: 'admin_ids',
                message: 'Clan must have at least one admin',
              }),
            ],
          ];
        }
      }

      const toDeleteStrings = (updateData.admin_idsToDelete || []).map((id) =>
        String(id),
      );
      const adminsAfterDeletion = (clan.admin_ids || [])
        .map((id) => String(id))
        .filter((adminId) => !toDeleteStrings.includes(adminId));
      const adminIds = Array.from(
        new Set([
          ...adminsAfterDeletion,
          ...(updateData.admin_idsToAdd || [])
            .map((id) => String(id))
            .filter((adminId) => !toDeleteStrings.includes(adminId)),
        ]),
      );
      const playersInClan: string[] = [];

      for (const player_id of adminIds) {
        const [player] =
          await this.playerService.readOneById<Player>(player_id);
        if (player?.clan_id?.toString() === id.toString()) {
          playersInClan.push(player_id);
        }
      }

      if (playersInClan.length === 0) {
        return [
          false,
          [
            new ServiceError({
              reason: SEReason.REQUIRED,
              field: 'admin_ids',
              message: 'Clan must have at least one admin',
            }),
          ],
        ];
      }

      // Only pass the admin_ids update to the service
      // Don't include other fields when handling admin changes
      const [wasUpdated, updateErrors] = await this.basicService.updateOneById(
        id,
        { admin_ids: playersInClan },
        options,
      );

      if (updateErrors) return [null, updateErrors];

      return [wasUpdated, null];
    }

    const [wasUpdated, updateErrors] = await this.basicService.updateOneById(
      id,
      updateData,
      options,
    );

    if (updateErrors) return [null, updateErrors];

    return [wasUpdated, null];
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
