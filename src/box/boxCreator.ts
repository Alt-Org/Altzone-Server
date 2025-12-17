import { Injectable } from '@nestjs/common';
import { CreateBoxDto } from './dto/createBox.dto';
import { IServiceReturn } from '../common/service/basicService/IService';
import { InjectModel } from '@nestjs/mongoose';
import { Box, BoxDocument } from './schemas/box.schema';
import { Model, MongooseError } from 'mongoose';
import { Player } from '../player/schemas/player.schema';
import { Clan } from '../clan/clan.schema';
import { GroupAdmin } from './groupAdmin/groupAdmin.schema';
import { BoxHelper } from './util/boxHelper';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { ObjectId } from 'mongodb';
import { ProfileService } from '../profile/profile.service';
import { PlayerService } from '../player/player.service';
import { convertMongooseToServiceErrors } from '../common/service/basicService/BasicService';
import { BoxService } from './box.service';
import { CreatedBox } from './payloads/CreatedBox';
import { ProfileDto } from '../profile/dto/profile.dto';
import UniqueFieldGenerator from './util/UniqueFieldGenerator';
import { Profile } from '../profile/profile.schema';
import { generateRandomClanName } from './util/generateRandomClanName';

@Injectable()
export default class BoxCreator {
  constructor(
    @InjectModel(Profile.name) private readonly profileModel: Model<Profile>,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
    @InjectModel(Clan.name) private readonly clanModel: Model<Clan>,
    @InjectModel(GroupAdmin.name)
    private readonly groupAdminModel: Model<GroupAdmin>,
    private readonly boxHelper: BoxHelper,
    private readonly profilesService: ProfileService,
    private readonly playerService: PlayerService,
    private readonly boxService: BoxService,
    private readonly uniqueFieldGenerator: UniqueFieldGenerator,
  ) {}

  /**
   * Initialize a box for testing session by creating a box, box admin profile and player
   *
   * Notice that if any errors occur on any of the initialization stage, all data of the box will be removed.
   *
   * @param boxToInit box to create
   *
   * @returns created box and all corresponding data to it on success or ServiceErrors:
   *
   * - NOT_UNIQUE if the provided adminPassword, player name already exist
   * - NOT_FOUND if the provided admin password does not exist
   * - REQUIRED if the provided input is null or undefined
   */
  public async createBox(
    boxToInit: CreateBoxDto,
  ): Promise<IServiceReturn<CreatedBox>> {
    if (!boxToInit)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'boxToInit',
            value: boxToInit,
            message: 'boxToInit parameter is required',
          }),
        ],
      ];

    const [, boxValidationErrors] = await this.validateBox(boxToInit);

    if (boxValidationErrors) return [null, boxValidationErrors];

    const boxToCreate_id = new ObjectId();
    const boxToCreate: Partial<Box> = {};
    boxToCreate.adminPassword = boxToInit.adminPassword;
    boxToCreate._id = boxToCreate_id;

    const [adminProfile, adminProfileErrors] = await this.createAdminProfile(
      boxToInit.adminPassword,
      boxToCreate_id.toString(),
    );
    if (adminProfileErrors) {
      await this.boxService.reset(boxToCreate._id);
      return [null, adminProfileErrors];
    }
    boxToCreate.adminProfile_id = adminProfile._id as unknown as ObjectId;

    const [adminPlayer, adminPlayerErrors] = await this.createAdminPlayer({
      name: boxToInit.playerName,
      backpackCapacity: 0,
      uniqueIdentifier: boxToInit.playerName,
      above13: true,
      parentalAuth: true,
      profile_id: adminProfile._id,
      box_id: boxToCreate_id.toString(),
    });
    if (adminPlayerErrors) {
      await this.boxService.reset(boxToCreate._id);
      return [null, adminPlayerErrors];
    }
    boxToCreate.adminPlayer_id = adminPlayer._id as unknown as ObjectId;

    const weekMs = 1000 * 60 * 60 * 24 * 7;
    boxToCreate.sessionResetTime = new Date().getTime() + weekMs;
    const monthMs = 1000 * 60 * 60 * 24 * 30;
    boxToCreate.boxRemovalTime = new Date().getTime() + monthMs;

    const clanName1 = await this.uniqueFieldGenerator.generateUniqueFieldValue(
      this.clanModel,
      'name',
      generateRandomClanName(),
    );
    const clanName2 = await this.uniqueFieldGenerator.generateUniqueFieldValue(
      this.clanModel,
      'name',
      generateRandomClanName(),
    );
    boxToCreate.clansToCreate = [{ name: clanName1 }, { name: clanName2 }];

    const [createdBox, errors] = await this.boxService.createOne(
      boxToCreate as BoxDocument,
    );

    if (errors) return [null, errors];

    await this.groupAdminModel.findOneAndUpdate(
      { password: boxToInit.adminPassword },
      { box_id: createdBox._id },
    );

    const {
      __v,
      id: _id,
      ...createdAdminPlayer
    } = (adminPlayer as any).toObject();

    return [
      {
        ...createdBox.toObject(),
        adminPlayer: createdAdminPlayer,
      },
      null,
    ];
  }

  /**
   * Validates provided box data
   * @param boxToValidate box data to validate
   *
   * @returns true if data is valid or ServiceErrors if found:
   *
   * - NOT_UNIQUE if the provided adminPassword, player name already exist
   * - NOT_FOUND if the provided admin password does not exist
   */
  private async validateBox(
    boxToValidate: CreateBoxDto,
  ): Promise<IServiceReturn<true>> {
    const groupAdmin = await this.groupAdminModel.findOne({
      password: boxToValidate.adminPassword,
    });
    if (!groupAdmin)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'adminPassword',
            message: 'Provided admin password is not found',
          }),
        ],
      ];

    const boxAlreadyCreated = await this.boxHelper.isBoxRegistered(
      boxToValidate.adminPassword,
    );
    if (boxAlreadyCreated)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_UNIQUE,
            field: 'adminPassword',
            message: 'Box for provided password is already created',
          }),
        ],
      ];

    const isAdminPlayerNameTaken = await this.playerModel.findOne({
      name: boxToValidate.playerName,
    });
    if (isAdminPlayerNameTaken)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_UNIQUE,
            field: 'playerName',
            value: boxToValidate.playerName,
            message: 'Provided player name is already taken',
          }),
        ],
      ];

    return [true, null];
  }

  /**
   * Creates a profile for group admin, where username and password are the same
   * @param adminPassword admin password to set
   * @param box_id box_id used for testing sessions
   * @returns created admin profile or ServiceErrors if any occurred
   */
  private async createAdminProfile(
    adminPassword: string,
    box_id: string,
  ): Promise<IServiceReturn<ProfileDto>> {
    const [createdProfile, errors] =
      await this.profilesService.createWithHashedPassword({
        username: adminPassword,
        password: adminPassword,
      });

    if (errors) return [null, errors];

    await this.profileModel.findOneAndUpdate(
      { _id: createdProfile._id },
      { box_id },
    );

    return [createdProfile, null];
  }

  /**
   * Creates a player for group admin
   * @param playerToCreate admin player to create
   * @returns created admin player or ServiceErrors if any occurred
   */
  private async createAdminPlayer(
    playerToCreate: Partial<Player> & { box_id: string },
  ): Promise<IServiceReturn<Player>> {
    const adminPlayer = await this.playerService.createOne(playerToCreate);
    if (adminPlayer instanceof MongooseError) {
      const creationErrors = convertMongooseToServiceErrors(adminPlayer);
      return [null, creationErrors];
    }

    return [adminPlayer.data[adminPlayer.metaData.dataKey], null];
  }
}
