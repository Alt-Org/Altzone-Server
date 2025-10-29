import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Connection, FilterQuery, Model } from 'mongoose';
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
import {
  IServiceReturn,
  TReadByIdOptions,
} from '../common/service/basicService/IService';
import { ObjectId } from 'mongodb';
import { SessionStage } from './enum/SessionStage.enum';
import { Profile } from '../profile/profile.schema';
import {
  cancelTransaction,
  endTransaction,
  InitializeSession,
} from '../common/function/Transactions';

@Injectable()
export class BoxService {
  public constructor(
    @InjectModel(Box.name) public readonly model: Model<Box>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    @InjectModel(Profile.name) private readonly profileModel: Model<Profile>,
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    @InjectModel(Room.name) public readonly roomModel: Model<Room>,
    @InjectModel(GroupAdmin.name)
    public readonly groupAdminModel: Model<GroupAdmin>,
    private readonly boxHelper: BoxHelper,
    @InjectConnection() private readonly connection: Connection,
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
   * - NOT_FOUND if any of the resources not found: profiles, players
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
   * Reads all Boxes in DB.
   *
   * @returns found Boxes
   */
  async readAll() {
    return this.basicService.readMany<Box>();
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
   * Resets testing session.
   *
   * That means removing all the data associated with the box created after the stage 2.
   *
   * @param box_id _id of the box, which data should be reset
   *
   * @returns true if box was reset or ServiceErrors:
   * - REQUIRED - if the box_id is null, undefined or empty string
   * - NOT_FOUND - if there are no box with this _id
   */
  public async reset(box_id: string | ObjectId): Promise<IServiceReturn<true>> {
    const [, validationErrors] = this.validateBoxId(box_id);
    if (validationErrors) return [null, validationErrors];

    const parsed_id = box_id.toString();

    const [box, readErrors] = await this.basicService.readOneById(parsed_id);
    if (readErrors) return [null, readErrors];

    const session = await InitializeSession(this.connection);

    const [, clearingErrors] = await this.clearSession(parsed_id, [
      ModelName.BOX,
      ModelName.GROUP_ADMIN,
      ModelName.FEEDBACK,
      ModelName.PLAYER,
      ModelName.PROFILE,
    ]);

    if (clearingErrors) {
      return await cancelTransaction(session, clearingErrors);
    }

    const [, adminProfileErrors] = await this.clearBoxCollection<Profile>(
      parsed_id,
      this.profileModel,
      {
        filter: { _id: { $ne: box.adminProfile_id } },
      },
    );

    if (adminProfileErrors) {
      return await cancelTransaction(session, adminProfileErrors);
    }

    const [, adminPlayerErrors] = await this.clearBoxCollection<Player>(
      parsed_id,
      this.playerModel,
      {
        filter: { _id: { $ne: box.adminPlayer_id } },
      },
    );

    if (adminPlayerErrors) {
      return await cancelTransaction(session, adminPlayerErrors);
    }

    await this.basicService.updateOneById<Partial<Box>>(parsed_id, {
      sessionStage: SessionStage.PREPARING,
    });

    const occurredErrors = [
      ...(clearingErrors ?? []),
      ...(adminProfileErrors ?? []),
      ...(adminPlayerErrors ?? []),
    ];
    if (occurredErrors.length !== 0) return await cancelTransaction(session, occurredErrors);

    return await endTransaction(session);
  }

  /**
   * Deletes the box and group admin and all the associated data.
   *
   * @param boxId - The ID of the box to delete.
   * @returns void promise.
   */
  async deleteBox(boxId: string | ObjectId) {
    const [, validationErrors] = this.validateBoxId(boxId);
    if (validationErrors) return [null, validationErrors];

    const parsed_id = boxId.toString();

    const [, readErrors] = await this.basicService.readOneById(parsed_id);
    if (readErrors) return [null, readErrors];

    return this.clearSession(boxId.toString(), [ModelName.FEEDBACK]);
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
    return this.basicService.readMany<BoxDocument>({
      filter: {
        $or: [
          { boxRemovalTime: { $lte: currentTime.getTime() } },
          { sessionResetTime: { $lte: currentTime.getTime() } },
        ],
      },
    });
  }

  /**
   * Remove all documents from DB with specified `box_id`.
   *
   * @param box_id _id of the box
   * @param collectionsToIgnore collections that should not be touched
   * @private
   */
  private async clearSession(
    box_id: string,
    collectionsToIgnore: ModelName[],
  ): Promise<IServiceReturn<true>> {
    const collections = mongoose.connection.models;
    const errors: ServiceError[] = [];

    for (const name in collections) {
      const collection = collections[name];

      if (!collectionsToIgnore.includes(name as ModelName)) {
        const [, clearingErrors] = await this.clearBoxCollection(
          box_id,
          collection,
        );
        errors.push(...(clearingErrors ?? []));
      }
    }

    if (errors.length !== 0) return [null, errors];

    return [true, null];
  }

  /**
   * Remove all documents from a specified collection with specified `box_id` field
   *
   * @param box_id _id of the box
   * @param model model where to remove
   * @param options removal options
   * @private
   */
  private async clearBoxCollection<T = never>(
    box_id: string,
    model: Model<T>,
    options?: {
      /**
       * additional filter for removing operation, which will be combined with box_id
       */
      filter?: FilterQuery<T>;
      /**
       * amount of documents to remove at a time
       * @default 50
       */
      batchSize?: number;
      /**
       * Max amount of document expected to be in DB. Required to prevent infinite loop.
       * @default 1000000
       */
      maxDocsCount?: number;
    },
  ): Promise<IServiceReturn<true>> {
    const { filter, batchSize, maxDocsCount } = {
      batchSize: 50,
      maxDocsCount: 1000000,
      ...options,
    };
    const deleteFilter = filter ? { box_id, ...filter } : { box_id };

    const errorsOccurred = [];
    const maxIterations = Math.ceil(maxDocsCount / batchSize);

    for (let i = 0; i < maxIterations; i++) {
      try {
        const docs = await model
          .find(deleteFilter)
          .limit(batchSize)
          .select('_id')
          .lean();
        if (docs.length === 0) break;

        const _idsToDelete = docs.map((doc) => doc._id);
        await model.deleteMany({ _id: { $in: _idsToDelete } });
      } catch (e) {
        errorsOccurred.push(e);
      }
    }

    if (errorsOccurred.length !== 0) {
      const errors = convertMongooseToServiceErrors(errorsOccurred);
      return [null, errors];
    }

    return [true, null];
  }

  /**
   * Validates provided box _id
   * @param box_id _id to validate
   * @private
   *
   * @return true if the box_id is valid, or ServiceError:
   * - REQUIRED - if the _id is not provided or empty string
   * - NOT_FOUND - if box with that _id does not exist
   */
  private validateBoxId(box_id: string | ObjectId): IServiceReturn<true> {
    if (!box_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'box_id',
            value: box_id?.toString(),
            message: 'Parameter box_id is required',
          }),
        ],
      ];

    return [true, null];
  }
}
