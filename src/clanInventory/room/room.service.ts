import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Connection } from 'mongoose';
import { Room } from './room.schema';
import { UpdateRoomDto } from './dto/updateRoom.dto';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RoomDto } from './dto/room.dto';
import RoomHelperService from './utils/room.helper.service';
import { ItemService } from '../item/item.service';
import { ModelName } from '../../common/enum/modelName.enum';
import BasicService from '../../common/service/basicService/BasicService';
import {
  TReadByIdOptions,
  TIServiceReadOneOptions,
  TIServiceReadManyOptions,
  TIServiceCreateManyOptions,
  TIServiceDeleteByIdOptions,
  TIServiceCreateOneOptions,
  IServiceReturn,
} from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import {
  cancelTransaction,
  endTransaction,
  initializeSession,
} from '../../common/function/Transactions';
import { DefaultRoom } from './const/roomConst';
import { SoulHomeService } from '../soulhome/soulhome.service';
import { RoomStatus } from './enum/roomStatus.enum';
import { ClanService } from '../../clan/clan.service';
import { StockService } from '../stock/stock.service';
import { SEReason } from '../../common/service/basicService/SEReason';

@Injectable()
export class RoomService {
  public constructor(
    @InjectModel(Room.name) public readonly model: Model<Room>,
    private readonly roomHelper: RoomHelperService,
    private readonly itemService: ItemService,
    @Inject(forwardRef(() => SoulHomeService))
    private readonly soulHomeService: SoulHomeService,
    @Inject(forwardRef(() => ClanService))
    private readonly clanService: ClanService,
    @Inject(forwardRef(() => StockService))
    private readonly stockService: StockService,
    @InjectConnection() private readonly connection: Connection,
  ) {
    this.refsInModel = [ModelName.ITEM, ModelName.SOULHOME];
    this.basicService = new BasicService(model);
  }

  public readonly refsInModel: ModelName[];
  public readonly basicService: BasicService;

  /**
   * Creates a new Room in DB.
   *
   * @param room - The Room data to create.
   * @param options - Optional mongoose ClientSession for transaction support.
   * @returns  created Room or an array of service errors if any occurred.
   */
  async createOne(room: CreateRoomDto, options?: TIServiceCreateOneOptions) {
    return this.basicService.createOne<CreateRoomDto, RoomDto>(room, options);
  }

  /**
   * Creates multiple Rooms in DB.
   *
   * @param rooms - The Rooms data to create.
   * @param options - Optional mongoose ClientSession for transaction support.
   * @returns  created Rooms or an array of service errors if any occurred.
   */
  async createMany(
    rooms: CreateRoomDto[],
    options?: TIServiceCreateManyOptions,
  ) {
    return this.basicService.createMany<CreateRoomDto, RoomDto>(rooms, options);
  }

  /**
   * Reads a Room by its _id in DB.
   *
   * @param _id - The Mongo _id of the Room to read.
   * @param options - Options for reading the Room.
   * @returns Room with the given _id on succeed or an array of ServiceErrors if any occurred.
   */
  async readOneById(_id: string, options?: TReadByIdOptions) {
    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        this.refsInModel.includes(ref),
      );

    return this.basicService.readOneById<RoomDto>(_id, optionsToApply);
  }

  /**
   * Reads a Room by its _id and player_id if the specified Player belongs to the same Clan as the Room's SoulHome
   *
   * @param _id - The Mongo _id of the Room to read.
   * @param player_id - The Mongo _id of the Player
   * @param options - Options for reading the Room.
   * @returns _Room_ object or array with _ServiceError_ with reason NOT_FOUND if the Player does not belong to the same Clan as the Room's SoulHome
   */
  async readOneByIdAndPlayerId(
    _id: string,
    player_id: string,
    options?: TIServiceReadOneOptions,
  ): Promise<[RoomDto | null, ServiceError[] | null]> {
    const [soulHome, errors] =
      await this.roomHelper.getPlayerSoulHome(player_id);
    if (errors || !soulHome) return [null, errors];

    const soulHome_id = soulHome._id;

    const optionsToApply = options ?? { filter: {}, includeRefs: undefined };
    if (optionsToApply.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        this.refsInModel.includes(ref),
      );

    optionsToApply.filter = { ...optionsToApply.filter, _id, soulHome_id };

    return this.basicService.readOne<RoomDto>(optionsToApply);
  }

  /**
   * Reads all Rooms of the Clan's SoulHome the Player belongs to.
   *
   * @param player_id - Mongo _id of the Player.
   * @param options - Options for reading Rooms.
   * @returns An array of Rooms if succeeded or an array of ServiceErrors if error occurred.
   */
  async readPlayerClanRooms(
    player_id: string,
    options?: TIServiceReadManyOptions,
  ): Promise<[RoomDto[] | null, ServiceError[] | null]> {
    const [soulHome, errors] =
      await this.roomHelper.getPlayerSoulHome(player_id);
    if (errors || !soulHome) return [null, errors];

    const soulHome_id = soulHome._id;

    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        this.refsInModel.includes(ref),
      );

    optionsToApply.filter = { ...optionsToApply.filter, soulHome_id };

    return this.basicService.readMany<RoomDto>(optionsToApply);
  }

  /**
   * Updates a Room by its _id in DB. The _id field is read-only and must be found from the parameter
   *
   * @param room - The data needs to be updated for the Room.
   * @returns _true_ if Room was updated successfully, _false_ if nothing was updated for the Room,
   * or a ServiceError array if Room was not found or something else went wrong.
   */
  async updateOneById(room: UpdateRoomDto) {
    const { _id, ...fieldsToUpdate } = room;
    return this.basicService.updateOneById(_id, fieldsToUpdate);
  }

  /**
   * Deletes a Room by its _id from DB.
   *
   * Notice that the method also removes all Items inside the Room
   *
   * @param _id - The Mongo _id of the Room to delete.
   * @param options - Optional mongoose ClientSession for transaction support.
   * @returns _true_ if Room was removed successfully, or a ServiceError array if the Room was not found or something else went wrong
   */
  async deleteOneById(_id: string, options?: TIServiceDeleteByIdOptions) {
    await this.itemService.deleteAllRoomItems(_id, options);
    return this.basicService.deleteOneById(_id, options);
  }

  /**
   * Deletes all Rooms associated with a SoulHome by its _id from DB.
   *
   * Notice that the method also removes all Items inside these Rooms
   *
   * @param soulHome_id - The Mongo _id of the Room to delete.
   * @param options - Optional mongoose ClientSession for transaction support.
   * @returns _true_ if Room was removed successfully, or a ServiceError array if the Room was not found or something else went wrong
   */
  async deleteAllSoulHomeRooms(
    soulHome_id: string,
    options?: TIServiceDeleteByIdOptions,
  ): Promise<[true | null, ServiceError[] | null]> {
    const [soulHomeRooms, errors] = await this.basicService.readMany<RoomDto>({
      filter: { soulHome_id },
    });
    if (errors || !soulHomeRooms) return [null, errors];

    for (const soulHomeRoom of soulHomeRooms)
      await this.itemService.deleteAllRoomItems(soulHomeRoom._id, options);

    return this.basicService.deleteMany({
      filter: { soulHome_id },
      ...options,
    });
  }

  /**
   * Activates specified rooms.
   *
   * The method sets `deactivationTimestamp` field to current + specified duration.
   * @param room_ids rooms to update
   * @param durationS how long in seconds room should remain active
   */
  async activateRoomsByIds(room_ids: string[], durationS: number) {
    const deactivationTimestamp = Date.now() + durationS * 1000;
    const updateObject = { deactivationTimestamp };

    for (let i = 0, l = room_ids.length; i < l; i++)
      await this.basicService.updateOneById(room_ids[i], updateObject);
  }

  /**
   * Reads all rooms associated with a given Soul Home.
   *
   * @param soulHome_id - The ID of the soulHome
   * @returns A promise that resolves to an array of RoomDto objects if successful, or a ServiceError array if something went wrong.
   */
  async readAllSoulHomeRooms(soulHome_id: string) {
    return await this.basicService.readMany<RoomDto>({
      filter: { soulHome_id },
    });
  }

  /**
   * Update one or multiple Rooms and their Items
   *
   * @param payload - Single Room or Array of Rooms with Items to update
   * @returns _true_ if update successful, else Errors
   */
  async updateSoulHomeRooms(
    payload: UpdateRoomDto | UpdateRoomDto[],
  ): Promise<IServiceReturn<boolean>> {
    if (!payload) {
      return [
        null,
        [
          new ServiceError({
            message: 'No room in the update',
            reason: SEReason.REQUIRED,
          }),
        ],
      ];
    }

    const rooms = Array.isArray(payload) ? payload : [payload];

    if (!rooms.length)
      return [
        null,
        [
          new ServiceError({
            message: 'No room in the update',
            reason: SEReason.REQUIRED,
          }),
        ],
      ];

    const [session, initErrors] = await initializeSession(this.connection);
    if (initErrors) return [null, initErrors];

    const roomBulk: any[] = [];
    const itemBulk: any[] = [];
    let soulHomeId: string | null = null;
    let clanId: string | null = null;

    for (const room of rooms) {
      const { _id, furniture: furnitureField, ...roomFields } = room;
      const furniture = furnitureField ?? [];
      const hasFurnitureUpdate = 'furniture' in room;
      const hasRoomFields = Object.keys(roomFields).length > 0;

      if (!hasRoomFields && !hasFurnitureUpdate) {
        return cancelTransaction(session, [
          new ServiceError({
            message: `No fields to update for room "${_id}"`,
            reason: SEReason.REQUIRED,
            field: '_id',
            value: _id,
          }),
        ]);
      }

      const [fullRoom, fullRoomErrors] = await this.basicService.readOneById(
        _id,
        { session },
      );
      if (fullRoomErrors) return cancelTransaction(session, fullRoomErrors);

      if (!soulHomeId) {
        soulHomeId = fullRoom.soulHome_id.toString();
        const [soulHome, soulHomeErrors] =
          await this.soulHomeService.basicService.readOneById(soulHomeId, {
            session,
          });
        if (soulHomeErrors) return cancelTransaction(session, soulHomeErrors);

        const [stock, stockErrors] =
          await this.stockService.basicService.readOne({
            filter: { clan_id: soulHome.clan_id },
            session,
          });
        if (stockErrors) return cancelTransaction(session, stockErrors);

        clanId = soulHome.clan_id.toString();
      }

      if (hasRoomFields) {
        roomBulk.push({
          updateOne: {
            filter: { _id },
            update: { $set: roomFields },
          },
        });
      }

      if (hasFurnitureUpdate) {
        const itemIds = furniture.map((item) => item._id);

        for (const item of furniture) {
          const { _id: itemId, ...itemFields } = item;
          itemBulk.push({
            updateOne: {
              filter: { _id: itemId },
              update: {
                $set: {
                  room_id: _id,
                  stock_id: null,
                  ...itemFields,
                },
              },
            },
          });
        }

        const [currentItems] = await this.itemService.basicService.readMany({
          filter: { room_id: _id },
          session,
        });

        if (currentItems) {
          const updatedSet = new Set(itemIds);
          const removedItemIds = currentItems
            .filter((item) => !updatedSet.has(item._id.toString()))
            .map((item) => item._id);

          if (removedItemIds.length > 0) {
            const [stock] = await this.stockService.basicService.readOne({
              filter: { clan_id: clanId },
              session,
            });

            itemBulk.push({
              updateMany: {
                filter: {
                  _id: { $in: removedItemIds },
                },
                update: {
                  $set: {
                    location: [-1, -1],
                    placedOn_id: null,
                    placedOnLocation: [-1, -1],
                    room_id: null,
                    stock_id: stock._id,
                  },
                },
              },
            });
          }
        }
      }
    }

    if (roomBulk.length) {
      const [, roomErrors] = await this.basicService.bulkWrite(roomBulk, {
        session,
      });
      if (roomErrors) return cancelTransaction(session, roomErrors);
    }

    if (itemBulk.length) {
      const [, itemErrors] = await this.itemService.basicService.bulkWrite(
        itemBulk,
        { session },
      );
      if (itemErrors) return cancelTransaction(session, itemErrors);
    }

    if (soulHomeId && clanId) {
      const [shRooms, shRoomsErrors] = await this.basicService.readMany({
        filter: { soulHome_id: soulHomeId },
        session,
      });
      if (shRoomsErrors) return cancelTransaction(session, shRoomsErrors);

      const allRoomIds = shRooms.map((r) => r._id);

      const [items] = await this.itemService.basicService.readMany({
        filter: { room_id: { $in: allRoomIds } },
        session,
      });

      const value = items
        ? items.reduce((sum, current) => sum + current.price, 0)
        : 0;

      const [, clanUpdateErrors] =
        await this.clanService.basicService.updateOneById(
          clanId,
          { $set: { furnitureTotalValue: value } },
          { session },
        );
      if (clanUpdateErrors) return cancelTransaction(session, clanUpdateErrors);
    }

    await endTransaction(session);

    return [true, null];
  }

  /**
   * Create data for a new Room in SoulHome
   *
   * @param clan_id - Id of Clan room belongs to
   * @param session - ClientSession
   * @returns If successful, New Room object, else Errors
   */
  async getSoulHomeRoom(
    clan_id: string,
    session: ClientSession,
  ): Promise<IServiceReturn<CreateRoomDto>> {
    const [soulHome, soulHomeErrors] =
      await this.soulHomeService.basicService.readOne({
        filter: { clan_id },
        session,
      });
    if (soulHomeErrors) return [null, soulHomeErrors];

    const position = await this.getRoomPosition(soulHome._id, session);

    const roomPosition = position ? position + 1 : 1;
    const defaultRoom: CreateRoomDto = {
      roomPosition: roomPosition,
      ...DefaultRoom,
      roomStatus: RoomStatus.ACTIVE,
      soulHome_id: soulHome._id,
    };

    return [defaultRoom, null];
  }

  /**
   * Get roomPosition of new Room
   *
   * @param soulHome_id - Id of the SoulHome
   * @param session - ClientSession
   * @returns Room or null
   */
  async getRoomPosition(
    soulHome_id: string,
    session: ClientSession,
  ): Promise<number> {
    const [room] = await this.basicService.readOne({
      filter: { soulHome_id: soulHome_id },
      sort: { roomPosition: -1 },
      session,
    });
    return room?.roomPosition;
  }

  /**
   * Deactivate the last Room in Clan SoulHome
   *
   * If no Room with roomStatus, looks for old Room to convert to new Room
   *
   * @param clan_id - Id of the Clan the Room belongs to
   * @param session - ClientSession
   * @returns True, if errors, Errors
   */
  async deactivateRoom(
    clan_id: string,
    session: ClientSession,
  ): Promise<IServiceReturn<boolean>> {
    const [soulHome, soulHomeErrors] =
      await this.soulHomeService.basicService.readOne({
        filter: { clan_id },
        session,
      });
    if (soulHomeErrors) return [null, soulHomeErrors];

    const now = new Date();

    const [updatedRoom] = await this.basicService.findOneAndUpdate(
      {
        $set: {
          deactivationTime: now,
          roomStatus: RoomStatus.INACTIVE,
        },
      },
      {
        filter: {
          soulHome_id: soulHome._id,
          roomStatus: RoomStatus.ACTIVE,
        },
        sort: { roomPosition: -1 },
        session,
      },
    );

    if (!updatedRoom) {
      const [oldRoom, oldRoomErrors] = await this.basicService.readOne({
        filter: { soulHome_id: soulHome._id, roomPosition: null },
        session,
      });
      if (oldRoomErrors) {
        const notFoundError = oldRoomErrors.every(
          (error) =>
            error instanceof ServiceError && error.reason == SEReason.NOT_FOUND,
        );
        if (!notFoundError) return [null, oldRoomErrors];

        return [true, null];
      }

      const position =
        (await this.getRoomPosition(soulHome._id, session)) + 1 || 1;
      const [, updatedRoomErrors] = await this.basicService.updateOneById(
        oldRoom._id,
        {
          $set: {
            roomPosition: position,
            roomColour: 'default',
            wallpaper: 'default',
            floorType: 'default',
            deactivationTime: now,
            roomStatus: RoomStatus.INACTIVE,
          },
        },
        { session },
      );
      if (updatedRoomErrors) return [null, updatedRoomErrors];
    }

    return [true, null];
  }
}
