import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { publicReferences, SoulHome } from './soulhome.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomService } from '../room/room.service';
import { SoulHomeDto } from './dto/soulhome.dto';
import { CreateSoulHomeDto } from './dto/createSoulHome.dto';
import { UpdateSoulHomeDto } from './dto/updateSoulHome.dto';
import { ModelName } from '../../common/enum/modelName.enum';
import BasicService from '../../common/service/basicService/BasicService';
import {
  IServiceReturn,
  TIServiceCreateOneOptions,
  TIServiceDeleteByIdOptions,
  TReadByIdOptions,
} from '../../common/service/basicService/IService';

@Injectable()
export class SoulHomeService {
  public constructor(
    @InjectModel(SoulHome.name) public readonly model: Model<SoulHome>,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
  ) {
    this.basicService = new BasicService(model);
  }

  public readonly basicService: BasicService;
  public readonly modelName: ModelName;

  /**
   * Creates a new SoulHome in DB.
   *
   * @param soulHome - The SoulHome data to create.
   * @param options - DB query options.
   * @returns  created SoulHome or an array of service errors if any occurred.
   */
  async createOne(
    soulHome: CreateSoulHomeDto,
    options?: TIServiceCreateOneOptions,
  ) {
    return this.basicService.createOne<CreateSoulHomeDto, SoulHomeDto>(
      soulHome,
      options,
    );
  }

  /**
   * Reads a SoulHome by its _id in DB.
   *
   * @param _id - The Mongo _id of the SoulHome to read.
   * @param options - Options for reading the SoulHome.
   * @returns SoulHome with the given _id on succeed or an array of ServiceErrors if any occurred.
   */
  async readOneById(_id: string, options?: TReadByIdOptions) {
    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        publicReferences.includes(ref),
      );

    return this.basicService.readOneById<SoulHomeDto>(_id, optionsToApply);
  }

  /**
   * Updates a SoulHome by its _id in DB. The _id field is read-only and must be found from the parameter
   *
   * @param soulHome - The data needs to be updated for the SoulHome.
   * @returns _true_ if SoulHome was updated successfully, _false_ if nothing was updated for the SoulHome,
   * or a ServiceError array if SoulHome was not found or something else went wrong.
   */
  async updateOneById(soulHome: UpdateSoulHomeDto) {
    const { _id, ...fieldsToUpdate } = soulHome;
    return this.basicService.updateOneById(_id, fieldsToUpdate);
  }

  /**
   * Deletes a SoulHome by its _id from DB.
   *
   * Notice that the method will also delete associated rooms.
   *
   * @param _id - The Mongo _id of the SoulHome to delete.
   * @param options - Optional session for transaction support.
   * @returns _true_ if SoulHome was removed successfully, or a ServiceError array if the SoulHome was not found or something else went wrong
   */
  async deleteOneById(_id: string, options?: TIServiceDeleteByIdOptions) {
    await this.roomService.deleteAllSoulHomeRooms(_id, options);
    return this.basicService.deleteOneById(_id, options);
  }

  /**
   * Read SoulHome of Clan Player belongs to. If Room is given as a parameter, get Rooms with Items.
   * 
   * @param _id - The Mongo _id of the SoulHome to read.
   * @param options - Options for reading the SoulHome.
   * @returns SoulHome with the given _id on succeed or an array of ServiceErrors if any occurred.
   */
  async readSoulHomeWithRooms(
    _id: string, 
    options?: TReadByIdOptions
  ): Promise<IServiceReturn<SoulHomeDto>> {
    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        publicReferences.includes(ref),
      );

    const [soulHome, soulHomeErrors] = await this.basicService.readOneById<SoulHomeDto>(_id);
    if (soulHomeErrors) return [null, soulHomeErrors];

    if (optionsToApply.includeRefs.includes(ModelName.ROOM)) {
      const roomOptions = {
        filter: {
          soulHome_id: soulHome._id
        },
        includeRefs: [ModelName.ITEM]
      }

      const [rooms, roomsErrors] = await this.roomService.basicService.readMany(roomOptions);
      if (roomsErrors) return [null, roomsErrors];

      soulHome.Room = rooms;
    }

    return [soulHome, null];
  }
}
