import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Profile, ProfileDocument } from './profile.schema';
import { RequestHelperService } from '../requestHelper/requestHelper.service';
import { IgnoreReferencesType } from '../common/type/ignoreReferences.type';
import { ModelName } from '../common/enum/modelName.enum';
import { PlayerService } from '../player/player.service';
import { AddBasicService } from '../common/base/decorator/AddBasicService.decorator';
import { BasicServiceDummyAbstract } from '../common/base/abstract/basicServiceDummy.abstract';
import { IBasicService } from '../common/base/interface/IBasicService';
import * as argon2 from 'argon2';
import { envVars } from '../common/service/envHandler/envVars';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import BasicService from '../common/service/basicService/BasicService';
import { CreateProfileDto } from './dto/createProfile.dto';
import { ProfileDto } from './dto/profile.dto';
import {
  IServiceReturn,
  TIServiceReadManyOptions,
} from '../common/service/basicService/IService';
import { PasswordGenerator } from '../common/function/passwordGenerator';
import { ObjectId } from 'mongodb';
import { GuestProfileDto } from './dto/guestProfile.dto';
import { createHash } from 'crypto';

const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: parseInt(envVars.PSW_MEMORY),
  timeCost: parseInt(envVars.PSW_TIME),
  parallelism: parseInt(envVars.PSW_PARALLELISM),
};

@Injectable()
@AddBasicService()
export class ProfileService
  extends BasicServiceDummyAbstract<ProfileDocument>
  implements IBasicService<ProfileDocument>
{
  public constructor(
    @InjectModel(Profile.name) public readonly model: Model<Profile>,
    private readonly playerService: PlayerService,
    private readonly requestHelperService: RequestHelperService,
    private readonly passwordGenerator: PasswordGenerator,
  ) {
    super();
    this.refsInModel = [ModelName.PLAYER];
    this.modelName = ModelName.PROFILE;
    this.basicService = new BasicService(model);
  }

  public readonly refsInModel: ModelName[];
  public readonly modelName: ModelName;
  public readonly basicService: BasicService;

  /**
   * This method serves as a replacement
   * for the deprecated readAll method from the BasicServiceDummyAbstract.
   * It should be renamed to readAll when the service is updated to the new way.
   *
   * @param options - Options for reading profiles.
   * @returns - An array of profiles if succeeded or an array of ServiceErrors if error occurred.
   */
  async getAll(options?: TIServiceReadManyOptions) {
    const optionsToApply = { ...(options || {}) };
    const refs = new Set(optionsToApply.includeRefs || []);
    this.refsInModel.forEach((ref) => refs.add(ref));
    optionsToApply.includeRefs = Array.from(refs);

    return this.basicService.readMany<ProfileDto>(optionsToApply);
  }

  /**
   * Creates a new Profile in DB with hashed password.
   *
   * @param profile - The Profile data to create.
   * @returns  created Profile or an array of service errors if any occurred.
   */
  async createWithHashedPassword(
    profile: CreateProfileDto,
  ): Promise<IServiceReturn<ProfileDto>> {
    const [hashedPassword, errors] = await this.hashPassword(profile.password);

    if (errors) return [null, errors];

    return this.basicService.createOne<any, ProfileDto>({
      ...profile,
      password: hashedPassword,
    });
  }

  /**
   * Creates a new username and hashed password, a new Profile and Player in the Database.
   *
   * @returns  with the new username and password.
   */
  async createGuestAccount(): Promise<IServiceReturn<GuestProfileDto>> {
    const password = this.passwordGenerator.generatePassword('fi');
    const prefix = 'Guest';
    const uniqueIdentifier = createHash('sha1')
      .update(new ObjectId().toHexString())
      .digest('hex')
      .slice(0, 8);
    const username = prefix + '-' + uniqueIdentifier;
    const isGuest = true;

    const [createdProfile, errors] = await this.createWithHashedPassword({
      username,
      password,
      isGuest,
    } as CreateProfileDto);

    if (errors) return [null, errors];

    try {
      await this.playerService.createOne({
        profile_id: createdProfile._id,
        name: username,
        uniqueIdentifier: username,
        backpackCapacity: 0,
      });
    } catch (e) {
      await this.deleteOneById(createdProfile._id);
      throw e;
    }

    return [
      {
        username: username,
        password: password,
      } as GuestProfileDto,
      null,
    ];
  }

  public clearCollectionReferences = async (
    _id: Types.ObjectId,
    _ignoreReferences?: IgnoreReferencesType,
  ): Promise<void> => {
    await this.playerService.deleteByCondition(
      { profile_id: _id },
      { isOne: true },
    );
  };

  /**
   * Hash the provided password
   * @param password password to hash
   * @return hashed password if everything is ok, or ServiceError if it could not be hashed
   */
  private async hashPassword(
    password: string,
  ): Promise<[string | null, ServiceError[] | null]> {
    try {
      const hashedPassword = await argon2.hash(password, ARGON2_CONFIG);
      return [hashedPassword, null];
    } catch (error) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.UNEXPECTED,
            message: 'Could not hash the provided password',
            additional: error,
          }),
        ],
      ];
    }
  }

  /**
   * Retrieves the logged user's profile, player, and clan information.
   *
   * @param profileId - The ID of the profile.
   * @param playerId - The ID of the player.
   * @returns An object containing the profile, player, and clan information or an ServiceError if the profile or player is not found.
   */
  async getLoggedUserInfo(
    profileId: string,
    playerId: string,
  ): Promise<IServiceReturn<ProfileDto>> {
    const [profile, profileReadingErrors] =
      await this.basicService.readOneById(profileId);

    if (profileReadingErrors) return [null, profileReadingErrors];

    const [player, playerReadingErrors] =
      await this.playerService.getPlayerById(playerId, {
        includeRefs: [ModelName.CLAN],
      });

    if (playerReadingErrors) return [null, playerReadingErrors];
    profile.Player = player;

    return [profile, null];
  }
}
