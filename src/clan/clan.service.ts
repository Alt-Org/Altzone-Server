import { CreateClanDto } from './dto/createClan.dto';
import { UpdateClanDto } from './dto/updateClan.dto';
import { deleteNotUniqueArrayElements } from '../common/function/deleteNotUniqueArrayElements';
import { deleteArrayElements } from '../common/function/deleteArrayElements';
import { PlayerDto } from '../player/dto/player.dto';
import { Injectable } from '@nestjs/common';
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
} from '../common/function/Transactions'; // imported for transaction support, same as Box before this

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

  // 1. Logic outside the transaction for prepping
  if (clanToCreate && !clanToCreate.isOpen && !clanToCreate.password) {
  clanToCreate.password = this.passwordGenerator.generatePassword('fi');
  }

  // 2. Create the Clan
  const [clan, clanErrors] = await this.basicService.createOne<any, ClanDto>(
  { ...clanToCreate, admin_ids: [player_id] },
  { session }
  );
  if (clanErrors) return await cancelTransaction(session, clanErrors);

  // 3. Find the role (Standard array logic, no session needed)
  const leaderRole = clan.roles.find(
  (role) => role.name === LeaderClanRole.name,
  );

  // 4. Update the player (Passing the session "baton")
  const [, playerErrors] = await this.playerService.updateOneById(
  player_id,
  { clan_id: clan._id, clanRole_id: leaderRole._id },
  { session },
  );
  if (playerErrors) return await cancelTransaction(session, playerErrors);

  // 5. Create Default Stock
  const [stock, stockErrors] = await this.clanHelperService.createDefaultStock(clan._id, session);
  if (stockErrors) return await cancelTransaction(session, stockErrors);

  // 6. Create Default SoulHome
  const [soulHome, soulHomeErrors] = await this.clanHelperService.createDefaultSoulHome(
    clan._id,
    clan.name,
    30,
    session,
  );
  if (soulHomeErrors) return await cancelTransaction(session, soulHomeErrors);

  // 7. Attach nested data for the return object
  clan.SoulHome = soulHome.SoulHome;
  clan.Stock = stock.Stock;

  // 8. Commit the transaction
  const [result, commitError] = await endTransaction<ClanDto>(session, clan as any);
  if (commitError) return [null, commitError];

  // 9. Fire-and-forget event (No session needed here as DB work is done)
  this.emitter.emitAsync('clan.create', { clan_id: clan._id });

  return [result, null];
  }

  public async createOneWithoutAdmin(
    clanToCreate: CreateClanDto,
  ): Promise<IServiceReturn<CreateWithoutDtoType>> {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    // 1. Password Prepping here (Safe to stay outside the transaction logic)
  if (clanToCreate && !clanToCreate.isOpen && !clanToCreate.password) {
    clanToCreate.password = this.passwordGenerator.generatePassword('fi');
  }

  // 2. Create the Clan (Passing the session)
  const [clan, clanErrors] = await this.basicService.createOne(
    { ...clanToCreate, playerCount: 0 },
    { session },
  );
  if (clanErrors) return await cancelTransaction(session, clanErrors);

  // 3. Create Default Stock (Passing session)
  const [stock, stockErrors] = await this.clanHelperService.createDefaultStock(clan._id, session);
  if (stockErrors) return await cancelTransaction(session, stockErrors);

  // 4. Create Default SoulHome (Passing session)
  const [soulHome, soulHomeErrors] = await this.clanHelperService.createDefaultSoulHome(
      clan._id,
      clan.name,
      30,
      session,
    );
  if (soulHomeErrors) return await cancelTransaction(session, soulHomeErrors);

  // 5. Map the nested data to the clan object
  // Note: These lowercase property names match your 'CreateWithoutDtoType'
  clan.soulHome = soulHome.SoulHome;
  clan.rooms = soulHome.Room;
  clan.soulHomeItems = soulHome.Item;
  clan.stock = stock.Stock;
  clan.stockItems = stock.Item;

  // 6. Finalize and Return
  // endTransaction returns the [data, error] tuple Hoan wants. 
  // We cast 'clan' to the expected return type.
  return await endTransaction<CreateWithoutDtoType>(session, clan as any);
  }

  async readOneById(_id: string, options?: TReadByIdOptions) {
    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        publicReferences.includes(ref),
      );
    return this.basicService.readOneById<ClanDto>(_id, optionsToApply);
  }

  async readAll(options?: TIServiceReadManyOptions) {
    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        publicReferences.includes(ref),
      );
    return this.basicService.readMany<ClanDto>(optionsToApply);
  }

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
            message: 'Clan can not be without at least one admin.',
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
            message: 'Clan can not be without at least one admin.',
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

  async updateOne(
    updateInfo: Partial<Clan>,
    options: TIServiceUpdateOneOptions,
  ) {
    return this.basicService.updateOne(updateInfo, options);
  }

  async deleteOneById(
    _id: string,
  ): Promise<[true | null, ServiceError[] | null]> {
    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    // 1. Read clan with the references to linked objects
    const [clan, clanErrors] = await this.basicService.readOneById<ClanDto>(
      _id,
      {
        includeRefs: [ModelName.SOULHOME, ModelName.STOCK, ModelName.PLAYER],
      },
    );
    if (clanErrors || !clan)
      return await cancelTransaction(session, clanErrors);

    // 2. Clear clan_id from all players in the clan here
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

    // 3. Delete linked Stock
    if (clan.Stock) {
      const [, stockDelErrors] = await this.stockService.deleteOneById(
        clan.Stock._id,
        session,
      );
      if (stockDelErrors)
        return await cancelTransaction(session, stockDelErrors);
    }

    // 4. Delete linked SoulHome
    if (clan.SoulHome) {
      const [, shDelErrors] = await this.soulhomeService.deleteOneById(
        clan.SoulHome._id,
        session,
      );
      if (shDelErrors) return await cancelTransaction(session, shDelErrors);
    }

    // 5. Delete the Clan itself
    const [, deleteErrors] = await this.basicService.deleteOneById(_id, {
      session,
    });
    if (deleteErrors) return await cancelTransaction(session, deleteErrors);

    // 6. Finalize and return
    return await endTransaction(session, true);
  }
}
