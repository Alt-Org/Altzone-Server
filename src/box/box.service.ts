import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, MongooseError } from 'mongoose';
import { Box, BoxDocument, publicReferences } from './schemas/box.schema';
import BasicService, {
  convertMongooseToServiceErrors,
} from '../common/service/basicService/BasicService';
import { BoxReference } from './enum/BoxReference.enum';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { ModelName } from '../common/enum/modelName.enum';
import { Player } from '../player/schemas/player.schema';
import { Clan } from '../clan/clan.schema';
import { Room } from '../clanInventory/room/room.schema';
import { GroupAdmin } from './groupAdmin/groupAdmin.schema';
import { BoxHelper } from './util/boxHelper';
import { ClanService } from '../clan/clan.service';
import { ProfileService } from '../profile/profile.service';
import {
  IServiceReturn,
  TReadByIdOptions,
} from '../common/service/basicService/IService';
import { cancelTransaction } from '../common/function/cancelTransaction';
import { CreateBoxDto } from './dto/createBox.dto';

@Injectable()
export class BoxService {
  public constructor(
    @InjectModel(Box.name) public readonly model: Model<Box>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    @InjectModel(Room.name) public readonly roomModel: Model<Room>,
    @InjectModel(GroupAdmin.name)
    public readonly groupAdminModel: Model<GroupAdmin>,
    private readonly boxHelper: BoxHelper,
    private readonly clanService: ClanService,
    private readonly profilesService: ProfileService,
  ) {
    this.refsInModel = publicReferences;
    this.basicService = new BasicService(model);
    this.adminBasicService = new BasicService(groupAdminModel);
  }

  public readonly refsInModel: BoxReference[];
  private readonly basicService: BasicService;
  private readonly adminBasicService: BasicService;

  /**
   * Creates a new box
   * @param box box to create
   * @returns created box on success or ServiceErrors:
   *
   * - REQUIRED if the provided input is null or undefined
   * - NOT_FOUND if any of the resources not found: profiles, players, clans, soul homes, stocks, rooms, chat
   * - NOT_UNIQUE if a box with provided admin password already exists
   * - validation errors if input is invalid
   */
  public async createOne(box: Box): Promise<IServiceReturn<BoxDocument>> {
    const [, validationErrors] = await this.boxHelper.validateBox(box);

    if (validationErrors) return [null, validationErrors];

    return this.basicService.createOne(box);
  }

  /**
   * Reads a Box by its _id in DB.
   *
   * @param _id - The Mongo _id of the Box to read.
   * @param options - Options for reading the Box.
   * @returns Box with the given _id on succeed or an array of ServiceErrors if any occurred.
   */
  async readOneById(_id: string, options?: TReadByIdOptions) {
    const optionsToApply = options;
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref: any) =>
        publicReferences.includes(ref),
      );

    return this.basicService.readOneById<BoxDocument>(_id, optionsToApply);
  }

  /**
   * Updates a Box by its _id in DB. The _id field is read-only and must be found from the parameter
   *
   * @param box - The data needs to be updated of the Box.
   * @returns _true_ if Box was updated successfully, _false_ if nothing was updated for the Box,
   * or a ServiceError:
   * - NOT_FOUND if the box was not found
   * - NOT_UNIQUE if attempting to update the box adminPassword, which already exists
   * - REQUIRED if _id is not provided
   */
  async updateOneById(box: Partial<Box>) {
    if (!box._id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: '_id',
            value: box._id,
            message: '_id field is required',
          }),
        ],
      ];
    const { _id, ...fieldsToUpdate } = box;

    const [isSuccess, errors] = await this.basicService.updateOneById(
      _id as any,
      fieldsToUpdate,
    );
    if (
      errors &&
      errors[0].reason === SEReason.NOT_UNIQUE &&
      errors[0].field === 'adminPassword'
    )
      errors[0].value = null;

    return [isSuccess, errors];
  }

  /**
   * Removes box data from DB and its references
   * @param _id _id of the box to be removed
   *
   * @returns true if box data was removed successfully or ServiceErrors if any occurred
   */
  public async deleteOneById(_id: string): Promise<IServiceReturn<true>> {
    const [boxToRemove, boxReadErrors] =
      await this.basicService.readOneById<BoxDocument>(_id);
    if (boxReadErrors) return [null, boxReadErrors];

    const [, boxRefRemoveErrors] = await this.deleteBoxReferences(
      boxToRemove.toObject(),
    );
    if (boxRefRemoveErrors) return [null, boxRefRemoveErrors];

    return this.basicService.deleteOneById(_id);
  }

  /**
   * Removes all data associated with the box including:
   * - clans and their soul homes, rooms, stocks
   * - profiles and players
   * - chat
   *
   * @param boxData box related data to be removed
   *
   * @returns true if references were removed or Service errors if any occurred
   */
  public async deleteBoxReferences(
    boxData: Partial<Box>,
  ): Promise<IServiceReturn<true>> {
    const session = await this.model.startSession();
    session.startTransaction();

    if (boxData.clan_ids) {
      for (let i = 0; i < boxData.clan_ids.length; i++) {
        const [, deleteErrors] = await this.clanService.deleteOneById(
          boxData.clan_ids[i].toString(),
        );
        if (deleteErrors) await cancelTransaction(session, deleteErrors);
      }
    }

    if (boxData.adminProfile_id) {
      const resp = await this.profilesService.deleteOneById(
        boxData.adminProfile_id.toString(),
      );
      if (resp instanceof MongooseError) {
        const deleteError = convertMongooseToServiceErrors(resp);
        await cancelTransaction(session, deleteError);
      }
    }

    if (boxData.testers) {
      const testerProfiles = boxData.testers.map((tester) => tester.profile_id);
      for (let i = 0; i < testerProfiles.length; i++) {
        const resp = await this.profilesService.deleteOneById(
          testerProfiles[i].toString(),
        );
        if (resp instanceof MongooseError) {
          const deleteError = convertMongooseToServiceErrors(resp);
          await cancelTransaction(session, deleteError);
        }
      }
    }

    await session.commitTransaction();
    await session.endSession();

    return [true, null];
  }

  /**
   * Retrieves the reset data for a box.
   *
   * @param boxId - The ID of the box to retrieve reset data for.
   * @returns The reset data for the box.
   * @throws Will throw an error if the box cannot be found.
   */
  async getBoxResetData(boxId: string) {
    const [box, error] = await this.readOneById(boxId, {
      includeRefs: [
        BoxReference.CLANS,
        BoxReference.ADMIN_PLAYER,
      ] as string[] as ModelName[],
    });
    if (error) throw error;

    const boxToCreate = new CreateBoxDto();
    boxToCreate.adminPassword = box.adminPassword;
    boxToCreate.playerName = box['AdminPlayer']['name'];
    const clans = box['Clans'];
    if (clans) boxToCreate.clanNames = [clans[0]['name'], clans[1]['name']];

    return boxToCreate;
  }

  /**
   * Deletes the box and group admin and all the associated data.
   *
   * @param boxId - The ID of the box to delete.
   * @returns void promise.
   * @throws Will throw an error if the deletion fails.
   */
  async deleteBox(boxId: string) {
    const session = await this.model.db.startSession();
    session.startTransaction();

    const [box, boxError] = await this.readOneById(boxId);
    if (boxError) return await cancelTransaction(session, boxError);

    const [, deleteBoxError] = await this.deleteOneById(boxId);
    if (deleteBoxError) return await cancelTransaction(session, deleteBoxError);

    const [, adminDeleteError] = await this.adminBasicService.deleteOne({
      filter: { password: box.adminPassword },
    });
    if (adminDeleteError)
      return await cancelTransaction(session, adminDeleteError);

    session.commitTransaction();
    session.endSession();
  }

  /**
   * Retrieves expired boxes based on the current time.
   * A box is considered expired if either its removal time or session reset time
   * is less than or equal to the provided current time.
   *
   * @param currentTime - The current date and time to compare against box expiration times.
   * @returns A promise that resolves to a service return object containing an array of expired box documents.
   */
  async getExpiredBoxes(
    currentTime: Date,
  ): Promise<IServiceReturn<BoxDocument[]>> {
    return await this.basicService.readMany<BoxDocument>({
      filter: {
        $or: [
          { boxRemovalTime: { $lte: currentTime.getTime() } },
          { sessionResetTime: { $lte: currentTime.getTime() } },
        ],
      },
    });
  }
}
