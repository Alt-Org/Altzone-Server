import { Injectable } from '@nestjs/common';
import { publicReferences, SoulHome } from './soulhome.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { RoomService } from '../room/room.service';
import { SoulHomeDto } from './dto/soulhome.dto';
import { CreateSoulHomeDto } from './dto/createSoulHome.dto';
import { UpdateSoulHomeDto } from './dto/updateSoulHome.dto';
import { ModelName } from '../../common/enum/modelName.enum';
import BasicService from '../../common/service/basicService/BasicService';
import {
  TIServiceCreateOneOptions,
  TIServiceDeleteByIdOptions,
  TReadByIdOptions,
} from '../../common/service/basicService/IService';
import { Environment } from '../../common/enum/environment.enum';

@Injectable()
export class SoulHomeService {
  public constructor(
    @InjectModel(SoulHome.name) public readonly model: Model<SoulHome>,
    private readonly roomService: RoomService,
    @InjectConnection() private readonly connection: Connection,
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
    const [created, createErrors] = await this.basicService.createOne<
      CreateSoulHomeDto,
      SoulHomeDto
    >(soulHome, options);

    if (createErrors) return [null, createErrors];

    const clan = await this.connection
      .model(ModelName.CLAN)
      .findById(soulHome.clan_id);

    if (!clan) return [created, null];

    const env =
      clan.environment === Environment.TEACHING_DEMO
        ? Environment.TEACHING_DEMO
        : Environment.OPEN_DEMO;

    if (created.environment === env) return [created, null];

    const updateOptions = options?.session ? { session: options.session } : {};
    const [updated, updateErrors] =
      await this.basicService.findByIdAndUpdate<SoulHome>(
        created._id.toString(),
        { environment: env },
        updateOptions,
      );

    if (updateErrors) return [created, null];

    return [updated, null];
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
}
