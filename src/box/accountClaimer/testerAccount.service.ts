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
import UniqueFieldGenerator from '../util/UniqueFieldGenerator';

@Injectable()
export class TesterAccountService {
  constructor(
    private readonly passwordGenerator: PasswordGenerator,
    private readonly uniqueFieldGenerator: UniqueFieldGenerator,
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
   * @param box_id _id of the box with which tester is associated with
   *
   * @returns created tester or ServiceError if any errors occurred during the creation process
   */
  async createTester(
    box_id: string,
  ): Promise<IServiceReturn<Omit<Tester, 'Clan'>>> {
    const password = this.passwordGenerator.generatePassword('fi');
    const [createdProfile, profileCreationErrors] = await this.createProfile(
      box_id,
      password,
    );
    if (profileCreationErrors) return [null, profileCreationErrors];
    const [createdPlayer, playerCreationErrors] = await this.createPlayer(
      box_id,
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

    const leaderRole = clanWithLeastPlayers.roles.find((role) => {
      return role.name === 'leader';
    });

    await this.playerModel.updateOne(
      { _id: player_id },
      {
        clan_id: clanWithLeastPlayers._id,
        clanRole_id: leaderRole._id,
      },
    );

    return [clanWithLeastPlayers, null];
  }

  /**
   * Create profile with provided username.
   * Notice that if a profile with the username already exists its value will be changed to be unique
   *
   * @param box_id with which profile should be associated
   * @param username to be used for the profile
   * @private
   *
   * @return created profile
   */
  private async createProfile(
    box_id: string,
    username: string,
  ): Promise<IServiceReturn<ProfileDto>> {
    const uniqueUsername =
      await this.uniqueFieldGenerator.generateUniqueFieldValue(
        this.profileModel,
        'username',
        username,
      );
    const profile = {
      username: uniqueUsername,
      password: uniqueUsername,
      box_id,
    };

    return this.profileService.createWithHashedPassword(profile);
  }

  /**
   * Create player with provided name.
   * Notice that if a player with the name or uniqueIdentifier already exists its value will be changed to be unique
   *
   * @param box_id with which player should be associated
   * @param names to be used for player names and unique identifiers
   * @param profile with which player should be associated
   * @private
   *
   * @return created player
   */
  private async createPlayer(
    box_id: string,
    names: string,
    profile: ProfileDto,
  ) {
    const uniqueName = await this.uniqueFieldGenerator.generateUniqueFieldValue(
      this.playerModel,
      'name',
      names,
    );
    const uniqueId = await this.uniqueFieldGenerator.generateUniqueFieldValue(
      this.playerModel,
      'uniqueIdentifier',
      names,
    );

    const player: Omit<Player, '_id'> & { box_id: string } = {
      box_id,
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
   * - NOT_FOUND the player with this _id does not exist
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
            reason: SEReason.NOT_AUTHORIZED,
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
   * - NOT_FOUND some of the clans does not exist
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
