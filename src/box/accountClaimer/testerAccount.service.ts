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
import { Box, BoxDocument } from '../schemas/box.schema';
import Tester from './payloads/tester';
import BasicService from '../../common/service/basicService/BasicService';

@Injectable()
export class TesterAccountService {
  constructor(
    private readonly passwordGenerator: PasswordGenerator,
    private readonly profileService: ProfileService,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,
    @InjectModel(Box.name) private readonly boxModel: Model<BoxDocument>,
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
   * Adds testers to clans of the specified box.
   * The testers will be added evenly to clans, so that in the end there will be the same amount of testers in each clan.
   *
   * Notice that the method does not check the existence of the testers' profiles and players
   *
   * @param box_id box _id where the testers should be added
   * @param testers testers to be added
   *
   * @returns true if the testers were added or ServiceError:
   *  - REQUIRED if box_id is null, undefined or an empty string, or testers is null, undefined or an empty array
   *  - NOT_FOUND if the box with provided _id is not found, or if the box does not have 2 clans
   */
  async addTestersToClans(
    box_id: ObjectId | string,
    testers: Tester[],
  ): Promise<IServiceReturn<true>> {
    if (!box_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'box_id',
            value: box_id,
            message: 'Box _id is required',
          }),
        ],
      ];

    if (!testers || testers.length === 0)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'testers',
            value: testers,
            message: 'testers array is required',
          }),
        ],
      ];

    const box = await this.boxModel.findById(box_id);
    if (!box)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'box_id',
            value: box_id,
            message: 'Box with provided _id is not found',
          }),
        ],
      ];

    if (box.clan_ids.length < 2)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'clan_ids',
            value: box.clan_ids,
            message: 'Box does not have 2 clans',
          }),
        ],
      ];

    const amount = testers.length;
    const boxPlayer_ids = testers.map((tester) => tester.Player._id);
    const boxPlayers = await this.playerModel
      .find({ _id: { $in: boxPlayer_ids } })
      .exec();
    const [clan1_id, clan2_id] = box.clan_ids;

    const clan1Players = boxPlayers.filter(
      (player) =>
        player.clan_id && player.clan_id.toString() === clan1_id.toString(),
    );
    const clan2Players = boxPlayers.filter(
      (player) =>
        player.clan_id && player.clan_id.toString() === clan2_id.toString(),
    );

    const largerAmountToAdd = Math.ceil(amount / 2);

    if (clan1Players.length < clan2Players.length) {
      const clan1TestersToAdd = testers.slice(0, largerAmountToAdd);
      const clan2TestersToAdd = testers.slice(largerAmountToAdd);
      const clan1Tester_ids = clan1TestersToAdd.map(
        (tester) => tester.Player._id,
      );
      const clan2Tester_ids = clan2TestersToAdd.map(
        (tester) => tester.Player._id,
      );
      await this.playerModel.updateMany(
        { _id: { $in: clan1Tester_ids } },
        { clan_id: clan1_id },
      );
      await this.playerModel.updateMany(
        { _id: { $in: clan2Tester_ids } },
        { clan_id: clan2_id },
      );
    } else {
      const clan2TestersToAdd = testers.slice(0, largerAmountToAdd);
      const clan1TestersToAdd = testers.slice(largerAmountToAdd);
      const clan1Tester_ids = clan1TestersToAdd.map(
        (tester) => tester.Player._id,
      );
      const clan2Tester_ids = clan2TestersToAdd.map(
        (tester) => tester.Player._id,
      );
      await this.playerModel.updateMany(
        { _id: { $in: clan1Tester_ids } },
        { clan_id: clan1_id },
      );
      await this.playerModel.updateMany(
        { _id: { $in: clan2Tester_ids } },
        { clan_id: clan2_id },
      );
    }

    return [true, null];
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
}
