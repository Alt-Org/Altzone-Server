import { Injectable } from '@nestjs/common';
import { IServiceReturn } from '../../common/service/basicService/IService';
import { ObjectId } from 'mongodb';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { PasswordGenerator } from '../../common/function/passwordGenerator';
import { Profile, ProfileDocument } from '../../profile/profile.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from '../../player/schemas/player.schema';
import { ProfileService } from '../../profile/profile.service';
import { ProfileDto } from '../../profile/dto/profile.dto';
import Tester from './payloads/tester';
import BasicService from '../../common/service/basicService/BasicService';
import { Clan, ClanDocument } from '../../clan/clan.schema';

@Injectable()
export class TesterAccountService {
  constructor(
    private readonly passwordGenerator: PasswordGenerator,
    private readonly profileService: ProfileService,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,
    @InjectModel(Clan.name)
    private readonly clanModel: Model<ClanDocument>,
  ) {
    this.playerBasicService = new BasicService(playerModel);
  }

  private readonly playerBasicService: BasicService;

  /**
   * Creates a new tester profile and player.
   *
   * @returns created tester or ServiceError if any errors occurred during the creation process
   */
  async createTester(): Promise<IServiceReturn<Omit<Tester, 'Clan'>>> {
    const password = this.passwordGenerator.generatePassword('fi');
    const [createdProfile, profileCreationErrors] =
      await this.createProfile(password);
    if (profileCreationErrors) return [null, profileCreationErrors];
    const [createdPlayer, playerCreationErrors] = await this.createPlayer(
      password,
      createdProfile,
    );
    if (playerCreationErrors) return [null, playerCreationErrors];

    return [
      {
        Profile: createdProfile,
        Player: createdPlayer,
      },
      null,
    ];
  }

  /**
   * Adds tester to a clan with the least amount of players in it, so that
   * the testers will be added evenly to clans, so that in the end there will be the same amount of testers in each clan.
   *
   * Notice that the method does not check the existence of the testers' profiles and players
   *
   * @param player_id tester's player _id, which need to be assigned to a clan
   * @param clan_ids clans' _ids where tester player can be added
   *
   * @returns clan, where the tester was put or ServiceError:
   *  - REQUIRED if player_id is null, undefined or an empty string, or clan_ids is null, undefined or an empty array
   *  - NOT_FOUND if the player_id or clan_ids not found
   */
  async addTesterToClan(
    player_id: ObjectId | string,
    clan_ids: ObjectId[] | string[],
  ): Promise<IServiceReturn<Clan>> {
    const [, player_idValidationErrors] =
      await this.validatePlayer_id(player_id);
    if (player_idValidationErrors) return [null, player_idValidationErrors];

    const [, clan_idsValidationErrors] = await this.validateClan_ids(clan_ids);
    if (clan_idsValidationErrors) return [null, clan_idsValidationErrors];

    const clanWithLeastPlayers = await this.clanModel
      .findOneAndUpdate(
        { _id: { $in: clan_ids } },
        { $inc: { playerCount: 1 } },
        {
          sort: { playerCount: 1 },
          new: true,
        },
      )
      .exec();

    await this.playerModel.updateOne(
      { _id: player_id },
      { clan_id: clanWithLeastPlayers._id },
    );

    return [clanWithLeastPlayers, null];
  }

  /**
   * Checks that each element in the provided array has a unique value in the DB.
   * If the value for provided field already exists an amount number will be added to the end of the value in order to make it unique.
   *
   * @param model model where the values should be unique
   * @param field unique field name
   * @param values of the unique fields
   * @private
   *
   * @returns an array, where each value is a unique in DB.
   */
  private async generateUniqueFieldValue(
    model: Model<any>,
    field: string,
    value: string,
  ): Promise<string> {
    const existingValues = await this.getExistingUniqueValue(
      model,
      field,
      value,
    );

    let uniqueValue = value;

    if (existingValues[value] !== undefined) {
      let highestNumber = existingValues[value];
      highestNumber++;
      uniqueValue = `${value}-${highestNumber}`;
    }

    while (await model.exists({ [field]: uniqueValue })) {
      existingValues[value]++;
      uniqueValue = `${value}-${existingValues[value]}`;
    }

    return uniqueValue;
  }

  /**
   * Searches for the amount of items in the DB, which field starts with the values.
   * If the value for provided field exists it will be added to the returned record.
   * For example if there are an items which start with "john" and "john-1", it will return that there are 2 values like this.
   *
   * @param model model where search for the values
   * @param field field name
   * @param value value to search
   * @private
   *
   * @returns an record containing values which were found in DB.
   */
  private async getExistingUniqueValue(
    model: Model<any>,
    field: string,
    value: string,
  ): Promise<Record<string, number>> {
    const existingItems = await model
      .find({
        [field]: { $regex: new RegExp(`^(${value})(-\\d+)?$`, 'i') },
      })
      .select(field)
      .lean();

    const valuesCounts: Record<string, number> = {};

    existingItems.forEach((item) => {
      const match = item[field].match(/^(.*?)(-(\d+))?$/);
      if (match) {
        const base = match[1];
        const number = match[3] ? parseInt(match[3], 10) : 0;

        if (!valuesCounts[base] || number > valuesCounts[base]) {
          valuesCounts[base] = number;
        }
      }
    });

    return valuesCounts;
  }

  /**
   * Create profile with provided username.
   * Notice that if a profile with the username already exists its value will be changed to be unique
   *
   * @param username to be used for the profile
   * @private
   *
   * @return created profile
   */
  private async createProfile(
    username: string,
  ): Promise<IServiceReturn<ProfileDto>> {
    const uniqueUsername = await this.generateUniqueFieldValue(
      this.profileModel,
      'username',
      username,
    );
    const profile = {
      username: uniqueUsername,
      password: uniqueUsername,
    };

    return this.profileService.createWithHashedPassword(profile);
  }

  /**
   * Create player with provided name.
   * Notice that if a player with the name or uniqueIdentifier already exists its value will be changed to be unique
   *
   * @param names to be used for player names and unique identifiers
   * @param profile with which player should be associated
   * @private
   *
   * @return created player
   */
  private async createPlayer(names: string, profile: ProfileDto) {
    const uniqueName = await this.generateUniqueFieldValue(
      this.playerModel,
      'name',
      names,
    );
    const uniqueId = await this.generateUniqueFieldValue(
      this.playerModel,
      'uniqueIdentifier',
      names,
    );

    const player: Omit<Player, '_id'> = {
      above13: true,
      backpackCapacity: 10,
      parentalAuth: true,
      points: 0,
      name: uniqueName,
      uniqueIdentifier: uniqueId,
      profile_id: profile._id,
      clan_id: null,
      clanRole_id: null,
    };

    return this.playerBasicService.createOne<Omit<Player, '_id'>, Player>(
      player,
    );
  }

  /**
   * Validates whenever provided player _id is valid.
   *
   * @param player_id player _id to validate
   * @private
   *
   * @returns true if it is a valid _id or ServiceError:
   * - REQUIRED the player _id is not provided or an empty string
   * - NOT_FOUND the player with this _id does not exists
   */
  private async validatePlayer_id(
    player_id: string | ObjectId,
  ): Promise<IServiceReturn<true>> {
    if (!player_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'player_id',
            value: player_id,
            message: 'player_id is required',
          }),
        ],
      ];

    const player = await this.playerModel.findById(player_id);
    if (!player)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'player_id',
            value: player_id.toString(),
            message: 'Player with provided _id is not found',
          }),
        ],
      ];

    if (player.clan_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            field: 'clan_id',
            value: player.clan_id.toString(),
            message: 'Player is already in a clan',
          }),
        ],
      ];

    return [true, null];
  }

  /**
   * Validates whenever provided clan _ids are valid.
   *
   * @param clan_ids clan _ids to validate
   * @private
   *
   * @returns true if it is a valid _id or ServiceError:
   * - REQUIRED the clan_ids _id is not provided or an empty array
   * - NOT_FOUND some of the clans does not exists
   */
  private async validateClan_ids(
    clan_ids: string[] | ObjectId[],
  ): Promise<IServiceReturn<true>> {
    if (!clan_ids || clan_ids.length === 0)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'clan_ids',
            value: clan_ids,
            message: 'clan_ids array is required',
          }),
        ],
      ];

    const clans = await this.clanModel.find({ _id: { $in: clan_ids } });
    if (clans.length !== clan_ids.length)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'clan_ids',
            value: clan_ids,
            message: 'Not all clans with provided _ids are found',
            additional: clans.map((clan) => clan._id.toString()),
          }),
        ],
      ];

    return [true, null];
  }
}
