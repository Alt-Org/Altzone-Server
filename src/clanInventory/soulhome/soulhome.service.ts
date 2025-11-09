import { Injectable } from '@nestjs/common';
import { publicReferences, SoulHome } from './soulhome.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import { RoomService } from '../room/room.service';
import { SoulHomeDto } from './dto/soulhome.dto';
import { CreateSoulHomeDto } from './dto/createSoulHome.dto';
import { UpdateSoulHomeDto } from './dto/updateSoulHome.dto';
import { ModelName } from '../../common/enum/modelName.enum';
import BasicService from '../../common/service/basicService/BasicService';
import { TReadByIdOptions } from '../../common/service/basicService/IService';
import {
  cancelTransaction,
  endTransaction,
  InitializeSession,
} from '../../common/function/Transactions';

@Injectable()
export class SoulHomeService {
  public constructor(
    @InjectModel(SoulHome.name) public readonly model: Model<SoulHome>,
    @InjectConnection() private readonly connection: Connection,
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
   * @returns  created SoulHome or an array of service errors if any occurred.
   */
  async createOne(soulHome: CreateSoulHomeDto) {
    return this.basicService.createOne<CreateSoulHomeDto, SoulHomeDto>(
      soulHome,
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
   * @param openedSession - (Optional) An already opened ClientSession to use.
   * @returns _true_ if SoulHome was removed successfully, or a ServiceError array if the SoulHome was not found or something else went wrong
   */
  async deleteOneById(_id: string, openedSession?: ClientSession) {
    const session = await InitializeSession(this.connection, openedSession);
    await this.roomService.deleteAllSoulHomeRooms(_id, session);

    const [_, error] = await this.basicService.deleteOneById(_id);
    if (error) {
      return await cancelTransaction(session, error, openedSession);
    }

    return await endTransaction(session, openedSession);
  }
}
