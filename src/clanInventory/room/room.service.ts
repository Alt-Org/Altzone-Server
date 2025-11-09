import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
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
} from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import {
  cancelTransaction,
  endTransaction,
  InitializeSession,
} from '../../common/function/Transactions';

@Injectable()
export class RoomService {
  public constructor(
    @InjectModel(Room.name) public readonly model: Model<Room>,
    @InjectConnection() private readonly connection: Connection,
    private readonly roomHelper: RoomHelperService,
    private readonly itemService: ItemService,
  ) {
    this.refsInModel = [ModelName.ITEM, ModelName.SOULHOME];
    this.basicService = new BasicService(model);
  }

  public readonly refsInModel: ModelName[];
  private readonly basicService: BasicService;

  /**
   * Creates a new Room in DB.
   *
   * @param room - The Room data to create.
   * @returns  created Room or an array of service errors if any occurred.
   */
  async createOne(room: CreateRoomDto) {
    return this.basicService.createOne<CreateRoomDto, RoomDto>(room);
  }

  /**
   * Creates multiple Rooms in DB.
   *
   * @param rooms - The Rooms data to create.
   * @returns  created Rooms or an array of service errors if any occurred.
   */
  async createMany(rooms: CreateRoomDto[]) {
    return this.basicService.createMany<CreateRoomDto, RoomDto>(rooms);
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
   * @operationId - Optional operation id for logging purposes
   * @returns _true_ if Room was removed successfully, or a ServiceError array if the Room was not found or something else went wrong
   */
  async deleteOneById(_id: string, openedSession?: ClientSession) {
    const session = await InitializeSession(this.connection, openedSession);
    await this.itemService.deleteAllRoomItems(_id);

    const [__, errorOne] = await this.basicService.deleteOneById(_id);
    if (errorOne) {
      return await cancelTransaction(session, errorOne, openedSession);
    }
    return await endTransaction(session, openedSession);
  }

  /**
   * Deletes all Rooms associated with a SoulHome by its _id from DB.
   *
   * Notice that the method also removes all Items inside these Rooms
   *
   * @param soulHome_id - The Mongo _id of the Room to delete.
   * @param openedSession - (Optional) An already opened ClientSession to use
   * @returns _true_ if Room was removed successfully, or a ServiceError array if the Room was not found or something else went wrong
   */
  async deleteAllSoulHomeRooms(
    soulHome_id: string,
    openedSession?: ClientSession,
  ): Promise<[true | null, ServiceError[] | null]> {
    const [soulHomeRooms, errors] = await this.basicService.readMany<RoomDto>({
      filter: { soulHome_id },
    });
    if (errors || !soulHomeRooms) return [null, errors];

    const session = await InitializeSession(this.connection, openedSession);
    try {
      for (let i = 0, l = soulHomeRooms.length; i < l; i++)
        await this.itemService.deleteAllRoomItems(soulHomeRooms[i]._id);

      await this.basicService.deleteMany({ filter: { soulHome_id } });
    } catch (error) {
      return await cancelTransaction(
        session,
        error as ServiceError[],
        openedSession,
      );
    }
    return await endTransaction(session, openedSession);
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
}
