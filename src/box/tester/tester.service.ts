import { Injectable } from '@nestjs/common';
import { IServiceReturn } from '../../common/service/basicService/IService';
import { ObjectId } from 'mongodb';
import { Tester } from '../schemas/tester.schema';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { PasswordGenerator } from './passwordGenerator';
import { Profile, ProfileDocument } from '../../profile/profile.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from '../../player/schemas/player.schema';
import { ProfileService } from '../../profile/profile.service';
import { ProfileDto } from '../../profile/dto/profile.dto';
import { Box, BoxDocument } from '../schemas/box.schema';

@Injectable()
export class TesterService {
  constructor(
    private readonly passwordGenerator: PasswordGenerator,
    private readonly profileService: ProfileService,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,
    @InjectModel(Box.name) private readonly boxModel: Model<BoxDocument>,
  ) {}

  /**
   * Creates new tester profiles and players.
   *
   * @param amount amount of testers to create.
   *
   * @returns created testers or ServiceError:
   *  - NOT_ALLOWED if the amount is negative number, more than 100 or equals zero
   *  - REQUIRED if the amount is null or undefined
   */
  async createTesters(amount: number): Promise<IServiceReturn<Tester[]>> {
    if (amount === undefined || amount === null)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'amount',
            value: amount,
            message: 'Amount of testers is required',
          }),
        ],
      ];

    if (amount <= 0)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            field: 'amount',
            value: amount,
            message: 'Amount of testers must be greater than 0',
          }),
        ],
      ];

    if (amount >= 100)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            field: 'amount',
            value: amount,
            message: 'Amount of testers must be less than 100',
          }),
        ],
      ];

    const passwords = this.generateUniquePasswords(amount);
    const [createdProfiles] = await this.createProfiles(passwords);
    const [createdPlayers] = await this.createPlayers(
      passwords,
      createdProfiles,
    );

    const testers: Tester[] = [];
    for (let i = 0; i < createdProfiles.length; i++) {
      const tester = {
        profile_id: createdProfiles[i]._id as any,
        player_id: createdPlayers[i]._id as any,
        isClaimed: false,
      };
      testers.push(tester);
    }

    return [testers, null];
  }

  /**
   * Adds testers data to the specified box.
   *
   * Notice that the method will not check the existence of the testers' profiles and players
   *
   * @param box_id _id of the box where the testers data should be registered
   * @param testers testers to register
   *
   * @returns true if the testers were registered or ServiceError:
   *  - REQUIRED if box_id is null, undefined or an empty string, or testers is null, undefined or an empty array
   *  - NOT_FOUND if the box with provided _id is not found
   */
  async addTestersToBox(
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

    await this.boxModel.findByIdAndUpdate(box_id, { $push: { testers } });

    return [true, null];
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
    const boxPlayer_ids = box.testers.map((tester) => tester.player_id);
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
        (tester) => tester.player_id,
      );
      const clan2Tester_ids = clan2TestersToAdd.map(
        (tester) => tester.player_id,
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
        (tester) => tester.player_id,
      );
      const clan2Tester_ids = clan2TestersToAdd.map(
        (tester) => tester.player_id,
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
   * Removes the specified amount of tester profiles and players from DB. As well as removes their data from box and clans.
   * The testers will be removed evenly from clans, so that in the end there will be the same amount of testers in each clan.
   *
   * Notice that the method will not remove any other data associated with the testers
   *
   * @param box_id box _id where the testers should be added
   * @param amount amount of testers to be removed
   *
   * @returns created testers or ServiceError:
   *  - NOT_ALLOWED if the amount is negative number or equals zero
   *  - REQUIRED if the box_id is null, undefined or an empty string or if amount is null or undefined
   *  - NOT_FOUND if the box with provided _id is not found, or if the specified amount is larger than the actual amount of testers
   */
  async deleteTesters(
    box_id: ObjectId | string,
    amount: number,
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

    if (amount === undefined || amount === null)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'amount',
            value: amount,
            message: 'Amount of testers is required',
          }),
        ],
      ];

    if (amount <= 0)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            field: 'amount',
            value: amount,
            message: 'Amount of testers must be greater than 0',
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

    if (box.testers.length < amount)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'amount',
            value: amount,
            message:
              'The amount of testers to remove could not be more than the amount of existing testers in the box',
          }),
        ],
      ];

    const boxPlayer_ids = box.testers.map((tester) => tester.player_id);
    const boxPlayers = await this.playerModel
      .find({ _id: { $in: boxPlayer_ids } })
      .exec();
    const [clan1_id, clan2_id] = box.clan_ids;

    const clan1Players = boxPlayers.filter(
      (player) => player.clan_id.toString() === clan1_id.toString(),
    );
    const clan2Players = boxPlayers.filter(
      (player) => player.clan_id.toString() === clan2_id.toString(),
    );

    const largerAmountToRemove = Math.ceil(amount / 2);
    const smallerAmountToRemove = amount - largerAmountToRemove;

    if (clan1Players.length >= clan2Players.length) {
      const clan1PlayersToRemove = clan1Players.slice(0, largerAmountToRemove);
      const clan2PlayersToRemove = clan2Players.slice(0, smallerAmountToRemove);
      const playersToRemove = clan1PlayersToRemove.concat(clan2PlayersToRemove);
      const player_idsToRemove = playersToRemove.map((player) =>
        player._id.toString(),
      );
      const testersToRemove = box.testers.filter((tester) =>
        player_idsToRemove.includes(tester.player_id.toString()),
      );
      const profile_idsToRemove = testersToRemove.map(
        (tester) => tester.profile_id,
      );

      await this.playerModel.deleteMany({ _id: { $in: player_idsToRemove } });
      await this.profileModel.deleteMany({ _id: { $in: profile_idsToRemove } });
      await this.boxModel.updateOne(
        { _id: box_id },
        { $pull: { testers: { profile_id: profile_idsToRemove } } },
      );
    } else {
      const clan1PlayersToRemove = clan1Players.slice(0, smallerAmountToRemove);
      const clan2PlayersToRemove = clan2Players.slice(0, largerAmountToRemove);
      const playersToRemove = clan1PlayersToRemove.concat(clan2PlayersToRemove);
      const player_idsToRemove = playersToRemove.map((player) =>
        player._id.toString(),
      );
      const testersToRemove = box.testers.filter((tester) =>
        player_idsToRemove.includes(tester.player_id.toString()),
      );
      const profile_idsToRemove = testersToRemove.map(
        (tester) => tester.profile_id,
      );

      await this.playerModel.deleteMany({ _id: { $in: player_idsToRemove } });
      await this.profileModel.deleteMany({ _id: { $in: profile_idsToRemove } });
      await this.boxModel.updateOne(
        { _id: box_id },
        { $pull: { testers: { profile_id: profile_idsToRemove } } },
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
  private async generateUniqueFieldValues(
    model: Model<any>,
    field: string,
    values: string[],
  ): Promise<string[]> {
    const uniqueValues: string[] = [];

    const existingValues = await this.getExistingUniqueValues(
      model,
      field,
      values,
    );

    for (const value of values) {
      let uniqueValue = value;

      if (existingValues[value] !== undefined) {
        let highestNumber = existingValues[value];
        highestNumber++;
        uniqueValue = `${value}-${highestNumber}`;
      }

      while (
        uniqueValues.includes(uniqueValue) ||
        (await model.exists({ [field]: uniqueValue }))
      ) {
        existingValues[value]++;
        uniqueValue = `${value}-${existingValues[value]}`;
      }

      uniqueValues.push(uniqueValue);
    }

    return uniqueValues;
  }

  /**
   * Searches for the amount of items in the DB, which field starts with the values.
   * If the value for provided field exists it will be added to the returned record.
   * For example if there are an items which start with "john" and "john-1", it will return that there are 2 values like this.
   *
   * @param model model where search for the values
   * @param field field name
   * @param values values to search
   * @private
   *
   * @returns an array containing values which were found in DB.
   */
  private async getExistingUniqueValues(
    model: Model<any>,
    field: string,
    values: string[],
  ): Promise<Record<string, number>> {
    const existingItems = await model
      .find({
        [field]: { $regex: new RegExp(`^(${values.join('|')})(-\\d+)?$`, 'i') },
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
   * Generates a set of unique passwords
   * @param amount how mach passwords to generate
   * @private
   *
   * @returns an array of unique passwords
   */
  private generateUniquePasswords(amount: number) {
    const passwords: string[] = [];
    for (let i = 0; i < amount; i++) {
      let password = this.passwordGenerator.generatePassword('fi');

      if (passwords.includes(password)) {
        while (true) {
          password = this.passwordGenerator.generatePassword('fi');
          if (!passwords.includes(password)) break;
        }
      }

      passwords.push(password);
    }

    return passwords;
  }

  /**
   * Create profiles with provided usernames.
   * Notice that if a profile with the username already exists its value will be changed to be unique
   *
   * @param usernames to be used for the profiles
   * @private
   *
   * @return created profiles
   */
  private async createProfiles(
    usernames: string[],
  ): Promise<IServiceReturn<ProfileDto[]>> {
    const uniqueUsernames = await this.generateUniqueFieldValues(
      this.profileModel,
      'username',
      usernames,
    );
    const createdProfiles: ProfileDto[] = [];
    for (let i = 0; i < uniqueUsernames.length; i++) {
      const profile = {
        username: uniqueUsernames[i],
        password: uniqueUsernames[i],
      };
      const [createdProfile, errors] =
        await this.profileService.createWithHashedPassword(profile);

      if (!errors) createdProfiles.push(createdProfile);
    }

    return [createdProfiles, null];
  }

  /**
   * Create players with provided names.
   * Notice that if a player with the name or uniqueIdentifier already exists its value will be changed to be unique
   *
   * @param names to be used for player names and unique identifiers
   * @param profiles with which players should be associated
   * @private
   *
   * @return created players
   */
  private async createPlayers(
    names: string[],
    profiles: ProfileDto[],
  ): Promise<IServiceReturn<Player[]>> {
    const uniqueNames = await this.generateUniqueFieldValues(
      this.playerModel,
      'name',
      names,
    );
    const uniqueIds = await this.generateUniqueFieldValues(
      this.playerModel,
      'uniqueIdentifier',
      names,
    );
    const playersToCreate: Partial<Player>[] = [];
    for (let i = 0; i < uniqueNames.length; i++) {
      const player: Partial<Player> = {
        above13: true,
        backpackCapacity: 10,
        parentalAuth: true,
        points: 0,
        name: uniqueNames[i],
        uniqueIdentifier: uniqueIds[i],
        profile_id: profiles[i]._id,
      };
      playersToCreate.push(player);
    }
    const createdPlayers = (await this.playerModel.insertMany(
      playersToCreate,
    )) as Player[];

    return [createdPlayers, null];
  }
}
