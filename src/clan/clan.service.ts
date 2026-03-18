import { CreateClanDto } from './dto/createClan.dto';
import { UpdateClanDto } from './dto/updateClan.dto';
import { ClanGovernanceUpdate } from './interface/clanGovernanceUpdate.interface';
import { deleteNotUniqueArrayElements } from '../common/function/deleteNotUniqueArrayElements';
import { deleteArrayElements } from '../common/function/deleteArrayElements';
import { PlayerDto } from '../player/dto/player.dto';
import { Injectable, Inject, forwardRef, Optional } from '@nestjs/common';
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
import { VotingService } from '../voting/voting.service';
import { GovernancePayload } from '../voting/type/governancePayload';

/**
 * Type representing a Clan with its associated sub-documents populated.
 */
type CreateWithoutDtoType = Clan & {
  soulHome: SoulHome;
  rooms: Room[];
  soulHomeItems: Item[];
  stock: Stock;
  stockItems: Item[];
};

/**
 * Service responsible for managing Clan logic, including CRUD operations,
 * administrative roles, and governance-based updates (voting).
 */
@Injectable()
export class ClanService {
  public constructor(
    @InjectModel(Clan.name) public readonly model: Model<Clan>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectConnection() private readonly connection: Connection,
    @Inject(PasswordGenerator)
    private readonly passwordGenerator: PasswordGenerator,
    private readonly stockService: StockService,
    private readonly soulhomeService: SoulHomeService,
    private readonly clanHelperService: ClanHelperService,
    private readonly emitter: GameEventEmitter,
    @Optional()
    @Inject(forwardRef(() => VotingService))
    private readonly votingService: VotingService,
  ) {
    this.basicService = new BasicService(model);
    this.playerService = new BasicService(playerModel);
  }

  /** Underlying basic service for Clan model operations */
  public readonly basicService: BasicService;
  /** Underlying basic service for Player model operations */
  public readonly playerService: BasicService;

  /**
   * Creates a new clan and assigns the creator as the leader and admin.
   * Initializes default clan inventory (Stock and SoulHome).
   * * @param clanToCreate - DTO containing initial clan data.
   * @param player_id - The ID of the player creating the clan.
   * @returns A promise resolving to the created ClanDto or service errors.
   */
  public async createOne(
    clanToCreate: CreateClanDto,
    player_id: string,
  ): Promise<IServiceReturn<ClanDto>> {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    if (
      clanToCreate &&
      clanToCreate.isOpen === false &&
      !clanToCreate.password
    ) {
      clanToCreate.password = this.passwordGenerator.generatePassword('fi');
    }

    const [clan, clanErrors] = await this.basicService.createOne<any, ClanDto>(
      { ...clanToCreate, admin_ids: [player_id] },
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
      await this.clanHelperService.createDefaultStock(clan._id, session);
    if (stockErrors) return await cancelTransaction(session, stockErrors);

    const [soulHome, soulHomeErrors] =
      await this.clanHelperService.createDefaultSoulHome(
        clan._id,
        clan.name,
        30,
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
   * Creates a clan without assigning an initial administrator.
   * Primarily used for system-generated or NPC clans.
   * * @param clanToCreate - DTO containing initial clan data.
   * @returns A promise resolving to the created clan with its inventory populated.
   */
  public async createOneWithoutAdmin(
    clanToCreate: CreateClanDto,
  ): Promise<IServiceReturn<CreateWithoutDtoType>> {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    if (
      clanToCreate &&
      clanToCreate.isOpen === false &&
      !clanToCreate.password
    ) {
      clanToCreate.password = this.passwordGenerator.generatePassword('fi');
    }

    const [clan, clanErrors] = await this.basicService.createOne(
      { ...clanToCreate, playerCount: 0 },
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
        30,
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
   * Retrieves a single clan by its unique identifier.
   * * @param _id - The unique ID of the clan.
   * @param options - Additional read options (e.g., population of references).
   * @returns A promise resolving to the ClanDto.
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
   * Retrieves multiple clans based on provided filter and pagination options.
   * * @param options - Read many options.
   * @returns A promise resolving to an array of ClanDtos.
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
   * Updates clan data. If the update includes governance-sensitive fields 
   * (roles or admin changes), it initiates a voting process instead of a direct update.
   * * @param clanToUpdate - DTO containing fields to update.
   * @param player_id - (Optional) ID of the player requesting the update. 
   * Required to initiate a vote.
   * @returns A promise resolving to true if action was successful (or vote started).
   */
  public async updateOneById(
    clanToUpdate: UpdateClanDto,
    player_id?: string,
  ): Promise<[boolean | null, ServiceError[] | null]> {
    if (
      typeof clanToUpdate.isOpen === 'boolean' &&
      clanToUpdate.isOpen === false &&
      !clanToUpdate.password
    ) {
      clanToUpdate.password = this.passwordGenerator.generatePassword('fi');
    }

    if (this.isGovernanceAction(clanToUpdate)) {
      if (!player_id) {
        return this.executeDirectUpdate(clanToUpdate);
      }

      const [voterPlayer, playerErrors] =
        await this.playerService.readOneById<PlayerDto>(player_id);
      if (playerErrors || !voterPlayer) return [null, playerErrors];

      const [, error] = await this.votingService.startGovernanceVoting({
        clanId: clanToUpdate._id,
        voterPlayer: voterPlayer,
        governancePayload: {
          roles: clanToUpdate.roles ?? [],
          admin_idsToAdd: clanToUpdate.admin_idsToAdd ?? [],
          admin_idsToDelete: clanToUpdate.admin_idsToDelete ?? [],
        },
      });

      if (error) return [null, error];
      return [true, null];
    }

    return this.executeDirectUpdate(clanToUpdate);
  }

  /**
   * Performs a direct database update for clan data.
   * Handles logic for adding/deleting administrators and ensuring 
   * a clan is never left without at least one valid admin.
   * * @param clanToUpdate - DTO containing update data.
   * @returns A promise resolving to the update status.
   */
  private async executeDirectUpdate(
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
    for (const p_id of admin_ids) {
      const [player, pErrors] =
        await this.playerService.readOneById<PlayerDto>(p_id);
      if (pErrors || !player || !player.clan_id) continue;

      if (player.clan_id.toString() === _id.toString())
        playersInClan.push(p_id);
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
   * Applies governance changes (roles and admins) after a successful vote.
   * This method uses a transaction to ensure all state changes are atomic.
   * * @param clanId - The ID of the clan to update.
   * @param payload - The approved governance changes.
   * @returns A promise resolving to the final update status.
   */
  public async applyGovernance(
    clanId: string,
    payload: GovernancePayload,
  ): Promise<IServiceReturn<boolean>> {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    const [clan, clanErrors] =
      await this.basicService.readOneById<ClanDto>(clanId);
    if (clanErrors || !clan)
      return await cancelTransaction(session, clanErrors);

    const fieldsToUpdate: ClanGovernanceUpdate = {};
    if (payload.roles) fieldsToUpdate.roles = payload.roles;

    let admin_ids: string[] = clan.admin_ids;
    if (payload.admin_idsToDelete)
      admin_ids = deleteArrayElements(admin_ids, payload.admin_idsToDelete);
    if (payload.admin_idsToAdd) {
      const idsToAdd = deleteNotUniqueArrayElements(payload.admin_idsToAdd);
      admin_ids = admin_ids ? [...admin_ids, ...idsToAdd] : idsToAdd;
      admin_ids = deleteNotUniqueArrayElements(admin_ids);
    }

    const playersInClan: string[] = [];
    for (const p_id of admin_ids) {
      const [player, pErrors] =
        await this.playerService.readOneById<PlayerDto>(p_id);
      if (pErrors || !player || !player.clan_id) continue;
      if (player.clan_id.toString() === clanId.toString())
        playersInClan.push(p_id);
    }

    if (playersInClan.length === 0) {
      return await cancelTransaction(session, [
        new ServiceError({
          message:
            'Governance execution failed: Clan must have at least one admin.',
          field: 'admin_ids',
          reason: SEReason.REQUIRED,
        }),
      ]);
    }

    fieldsToUpdate.admin_ids = playersInClan;
    const [result, updateErrors] = await this.basicService.updateOneById(
      clanId,
      fieldsToUpdate,
      { session },
    );
    if (updateErrors) return await cancelTransaction(session, updateErrors);

    const [finalResult, commitError] = await endTransaction<boolean>(
      session,
      result,
    );
    if (commitError) return [null, commitError];

    this.emitter.emitAsync('clan.update', { clan_id: clanId });
    return [finalResult, null];
  }

  /**
   * Standard update operation for internal service use.
   * * @param updateInfo - Partial clan data to update.
   * @param options - Service update options.
   * @returns A promise resolving to the update result.
   */
  async updateOne(
    updateInfo: Partial<Clan>,
    options: TIServiceUpdateOneOptions,
  ) {
    return this.basicService.updateOne(updateInfo, options);
  }

  /**
   * Deletes a clan by ID and performs cleanup for all related entities:
   * 1. Removes the clan reference from all associated players.
   * 2. Deletes the clan's Stock.
   * 3. Deletes the clan's SoulHome.
   * * @param _id - The ID of the clan to delete.
   * @returns A promise resolving to true if deletion and cleanup were successful.
   */
  async deleteOneById(
    _id: string,
  ): Promise<[true | null, ServiceError[] | null]> {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    const [clan, clanErrors] = await this.basicService.readOneById<ClanDto>(
      _id,
      { includeRefs: [ModelName.SOULHOME, ModelName.STOCK, ModelName.PLAYER] },
    );
    if (clanErrors || !clan)
      return await cancelTransaction(session, clanErrors);

    if (clan.Player) {
      for (const player of clan.Player) {
        const [, upErrors] = await this.playerService.updateOneById(
          player._id,
          { clan_id: null },
          { session },
        );
        if (upErrors) return await cancelTransaction(session, upErrors);
      }
    }

    if (clan.Stock) {
      const [, stockDelErrors] = await this.stockService.deleteOneById(
        clan.Stock._id,
        { session },
      );
      if (stockDelErrors)
        return await cancelTransaction(session, stockDelErrors);
    }

    if (clan.SoulHome) {
      const [, shDelErrors] = await this.soulhomeService.deleteOneById(
        clan.SoulHome._id,
        { session },
      );
      if (shDelErrors) return await cancelTransaction(session, shDelErrors);
    }

    const [, deleteErrors] = await this.basicService.deleteOneById(_id, {
      session,
    });
    if (deleteErrors) return await cancelTransaction(session, deleteErrors);

    return await endTransaction<true>(session, true);
  }

  /**
   * Determines if the proposed update requires clan governance (voting).
   * Governance is required if roles are being modified or if admins are 
   * being added or removed.
   * * @param clanToUpdate - The update DTO to check.
   * @returns True if governance is required, false otherwise.
   */
  private isGovernanceAction(clanToUpdate: UpdateClanDto): boolean {
    return (
      !!clanToUpdate.roles ||
      (!!clanToUpdate.admin_idsToAdd &&
        clanToUpdate.admin_idsToAdd.length > 0) ||
      (!!clanToUpdate.admin_idsToDelete &&
        clanToUpdate.admin_idsToDelete.length > 0)
    );
  }
}