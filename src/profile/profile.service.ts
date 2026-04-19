import { Injectable } from '@nestjs/common';
import { ClientSession, Model, Types } from 'mongoose';
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
import { JwtService } from '@nestjs/jwt';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { RecoveryConstants } from './const/recoveryConst';
import { Environment } from '../common/enum/environment.enum';

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
    private readonly jwtService: JwtService,
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
   * @param session - Optional transaction session.
   * @returns  created Profile or an array of service errors if any occurred.
   */
  async createWithHashedPassword(
    profile: CreateProfileDto,
    session?: ClientSession,
  ): Promise<IServiceReturn<ProfileDto>> {
    const [hashedPassword, errors] = await this.hashPassword(profile.password);

    if (errors) return [null, errors];

    if (
      (profile.securityQuestion && !profile.securityAnswer) ||
      (!profile.securityQuestion && profile.securityAnswer)
    )
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message:
              'securityQuestion and securityAnswer are required together',
          }),
        ],
      ];

    if (profile.securityAnswer) {
      const [hashedAnswer, errors] = await this.hashPassword(
        profile.securityAnswer,
      );

      if (errors) return [null, errors];

      profile.securityAnswer = hashedAnswer;
    }

    const environment = profile.environment ?? Environment.TEACHING_DEMO;

    if (environment === Environment.TEACHING_DEMO) {
      profile.expiresAt = new Date(Date.now() + 1000 * 60 * 60); // expires in 1 hour
    } else {
      profile.expiresAt = undefined;
    }

    profile.environment = environment;

    return this.basicService.createOne<any, ProfileDto>(
      {
        ...profile,
        password: hashedPassword,
      },
      { session },
    );
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

  /**
   * Get profile securityQuestion
   *
   * @param username - Profile username
   * @returns securityQuestion
   */
  async getSecurityQuestion(
    username: string,
  ): Promise<IServiceReturn<{ securityQuestion: string }>> {
    if (!username)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'Method param is required',
          }),
        ],
      ];

    const [profile, errors] = await this.basicService.readOne({
      filter: { username },
    });

    if (errors) return [null, errors];

    if (!profile || !profile.securityQuestion)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            message: 'Security question not available',
          }),
        ],
      ];

    return [{ securityQuestion: profile.securityQuestion }, null];
  }

  /**
   * Verify profile securityAnswer
   *
   * Verify answer against profile answer.
   *
   * @param username - Profile username
   * @param answer - Security answer
   * @returns If _true_, returns resetToken, else error
   */
  async verifySecurityAnswer(
    username: string,
    answer: string,
  ): Promise<IServiceReturn<{ resetToken: string }>> {
    if (!username || !answer) return this.handleVerifyFailure();

    const [profile, errors] = await this.basicService.readOne({
      filter: { username },
    });

    if (errors) return [null, errors];

    let updatedProfile: Profile = profile;
    let updateErrors: ServiceError[];
    const now = new Date();

    if (profile.recoveryLockedUntil && profile.recoveryLockedUntil <= now) {
      const update = {
        $set: {
          failedRecoveryAttempts: 0,
          recoveryLockedUntil: null,
        },
      };

      [updatedProfile, updateErrors] =
        await this.basicService.findByIdAndUpdate<Profile>(profile._id, update);

      if (updateErrors) return [null, updateErrors];
    }

    if (
      updatedProfile.recoveryLockedUntil &&
      updatedProfile.recoveryLockedUntil > now
    )
      return this.handleVerifyFailure();

    if (!updatedProfile.securityAnswer) return this.handleVerifyFailure();

    let isRight: boolean;
    try {
      isRight = await argon2.verify(updatedProfile.securityAnswer, answer);
    } catch (error) {
      return this.handleVerifyFailure();
    }

    if (!isRight) return this.handleFailedAttempt(updatedProfile._id);

    return this.handleSuccessfulAttempt(
      updatedProfile._id,
      updatedProfile.tokenVersion ?? 0,
    );
  }

  /**
   * Helper function for verifySecurityAnswer.
   *
   * Increments failedRecoveryAttempts, sets recoveryLockedUntil if count >= max attempts.
   *
   * @param _id - Profile _id
   * @returns error
   */
  private async handleFailedAttempt(
    _id: string,
  ): Promise<IServiceReturn<null>> {
    const [updatedProfile, errors] =
      await this.basicService.findByIdAndUpdate<Profile>(_id, {
        $inc: { failedRecoveryAttempts: 1 },
      });

    if (errors) return [null, errors];

    if (
      updatedProfile.failedRecoveryAttempts >= RecoveryConstants.maxAttempts
    ) {
      const update = {
        $set: {
          recoveryLockedUntil: new Date(
            Date.now() + RecoveryConstants.lockoutTime,
          ),
        },
      };

      const [, errors] = await this.basicService.updateOneById(
        updatedProfile._id,
        update,
      );

      if (errors) return [null, errors];
    }

    return this.handleVerifyFailure();
  }

  /**
   * Helper function for verifySecurityAnswer
   *
   * Sets failedRecoveryAttempts to 0 and recoveryLockedUntil to null. Generates resetToken.
   *
   * @param _id - Profile _id
   * @param tokenVersion - Profile tokenVersion, used in token validation
   * @returns resetToken
   */
  private async handleSuccessfulAttempt(
    _id: string,
    tokenVersion: number,
  ): Promise<IServiceReturn<{ resetToken: string }>> {
    const update = {
      $set: {
        failedRecoveryAttempts: 0,
        recoveryLockedUntil: null,
      },
    };

    const [, errors] = await this.basicService.updateOneById(_id, update);

    if (errors) return [null, errors];

    const payload = {
      _id,
      type: 'recovery',
      tokenVersion: tokenVersion,
    };

    const resetToken = {
      resetToken: await this.jwtService.signAsync(payload, {
        expiresIn: RecoveryConstants.tokenTime,
      }),
    };

    return [resetToken, null];
  }

  /**
   * Handle verification errors
   *
   * @returns error
   */
  private handleVerifyFailure(): IServiceReturn<null> {
    return [
      null,
      [
        new ServiceError({
          reason: SEReason.NOT_ALLOWED,
          message: 'Invalid username or answer',
        }),
      ],
    ];
  }

  /**
   * Reset profile password
   *
   * _id, type and tokenVersion are used to validate token
   *
   * @param resetToken - Token required to change password
   * @param newPassword - New password
   * @returns If successful, _true_, else errors
   */
  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<IServiceReturn<boolean>> {
    if (!resetToken || !newPassword)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'Method params are required',
          }),
        ],
      ];

    let payload: { type: string; _id: string; tokenVersion: number };
    try {
      payload = await this.jwtService.verifyAsync(resetToken);
    } catch (error) {
      return this.handleTokenFailure();
    }

    const [profile, readErrors] = await this.basicService.readOneById(
      payload._id,
    );

    if (readErrors) return [null, readErrors];

    if (payload.type !== 'recovery') return this.handleTokenFailure();

    const profileVersion = profile.tokenVersion ?? 0;
    if (profileVersion !== payload.tokenVersion)
      return this.handleTokenFailure();

    const [hashedPassword, hashErrors] = await this.hashPassword(newPassword);

    if (hashErrors) return [null, hashErrors];

    const update = {
      $set: {
        password: hashedPassword,
        failedRecoveryAttempts: 0,
        recoveryLockedUntil: null,
      },
      $inc: {
        tokenVersion: 1,
      },
    };

    return this.basicService.updateOneById(payload._id, update);
  }

  private handleTokenFailure(): IServiceReturn<null> {
    return [
      null,
      [
        new ServiceError({
          reason: SEReason.NOT_ALLOWED,
          message: 'Invalid token',
        }),
      ],
    ];
  }

  /**
   * Update profile
   *
   * Replaces deprecated updateOneById
   *
   * @param _id - Id from accessToken.
   * @param profileToUpdate - Object with fields to update.
   * Note that securityQuestion and securityAnswer are required together.
   * @returns If successful, _true_, else error
   */
  async updateProfileById(
    _id: string,
    profileToUpdate: UpdateProfileDto,
  ): Promise<IServiceReturn<boolean>> {
    if (!_id || !profileToUpdate)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'Method params are required',
          }),
        ],
      ];

    const { username, password, securityQuestion, securityAnswer } =
      profileToUpdate;

    const update: { $set: Partial<UpdateProfileDto> } = { $set: {} };

    if (username) update.$set.username = username;

    if (password) {
      const [hashedPassword, errors] = await this.hashPassword(password);

      if (errors) return [null, errors];

      update.$set.password = hashedPassword;
    }

    if (
      (securityQuestion && !securityAnswer) ||
      (!securityQuestion && securityAnswer)
    )
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message:
              'securityQuestion and securityAsnwer are required together',
          }),
        ],
      ];

    if (securityQuestion && securityAnswer) {
      const [hashedAnswer, errors] = await this.hashPassword(securityAnswer);

      if (errors) return [null, errors];

      update.$set.securityQuestion = securityQuestion;
      update.$set.securityAnswer = hashedAnswer;
    }

    if (Object.keys(update.$set).length === 0)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            message: 'No fields provided for update',
          }),
        ],
      ];

    return this.basicService.updateOneById(_id, update);
  }
}
