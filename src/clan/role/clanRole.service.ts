import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Clan } from '../clan.schema';
import { Model } from 'mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { ClanRole } from './ClanRole.schema';
import { ObjectId } from 'mongodb';
import { IServiceReturn } from '../../common/service/basicService/IService';
import { CreateClanRoleDto } from './dto/createClanRole.dto';
import { doesRoleWithRightsExists, isRoleNameExists } from './clanRoleUtils';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import { ClanRoleType } from './enum/clanRoleType.enum';
import { UpdateClanRoleDto } from './dto/updateClanRole.dto';
import SetClanRoleDto from './dto/setClanRole.dto';
import { Player } from '../../player/schemas/player.schema';
import { VotingQueueParams } from '../../fleaMarket/types/votingQueueParams.type';
import { VotingService } from '../../voting/voting.service';
import { PlayerDto } from '../../player/dto/player.dto';
import { VotingType } from '../../voting/enum/VotingType.enum';
import { VotingQueue } from '../../voting/voting.queue';
import { VotingQueueName } from '../../voting/enum/VotingQueue.enum';
import { CronExpression } from '@nestjs/schedule';

/**
 * Manages clan roles
 */
@Injectable()
export default class ClanRoleService {
  public constructor(
    @InjectModel(Clan.name) public readonly clanModel: Model<Clan>,
    @InjectModel(Player.name) public readonly playerModel: Model<Player>,
    private readonly votingService: VotingService,
    private readonly votingQueue: VotingQueue,
  ) {
    this.clanService = new BasicService(clanModel);
    this.playerService = new BasicService(playerModel);
  }

  public readonly clanService: BasicService;
  public readonly playerService: BasicService;

  /**
   * Creates a new role for a specified clan.
   *
   * Notice that the role name must be unique inside the clan and there should not be a role with exact same rights.
   *
   * @param roleToCreate role that need to be created
   * @param clan_id clan where the role will be created
   *
   * @returns created role on success or ServiceErrors if:
   * - NOT_UNIQUE clan has role with that name or there is a role with the same rights
   * - NOT_FOUND if the clan could not be found
   */
  async createOne(
    roleToCreate: CreateClanRoleDto,
    clan_id: string | ObjectId,
  ): Promise<IServiceReturn<ClanRole>> {
    const [clan, clanReadingErrors] = await this.clanService.readOneById(
      clan_id.toString(),
    );

    if (clanReadingErrors) return [null, clanReadingErrors];

    const [, uniquenessErrors] = this.validateClanRoleUniqueness(
      roleToCreate,
      clan.roles,
    );
    if (uniquenessErrors) return [null, uniquenessErrors];

    const newRole: Omit<ClanRole, '_id'> = {
      ...roleToCreate,
      clanRoleType: ClanRoleType.NAMED,
    };
    const [, clanUpdateErrors] = await this.clanService.updateOneById(
      clan_id.toString(),
      {
        $push: { roles: [newRole] },
      },
    );

    if (clanUpdateErrors) return [null, clanUpdateErrors];

    const [updatedClan] = await this.clanService.readOneById<Clan>(
      clan_id.toString(),
    );
    const createdRole = updatedClan.roles.find(
      (role) => role.name === newRole.name,
    );

    return [createdRole, null];
  }

  /**
   * Updates specified role by provided _id
   *
   * Notice that the role name must be unique inside the clan and there should not be a role with exact same rights.
   *
   * @param roleToUpdate role data to update
   * @param clan_id clan which role will be updated
   *
   * @returns true if role was updated or ServiceError if:
   * - NOT_UNIQUE clan has role with that name or there is a role with the same rights.
   * Notice that it does not apply to the own data of role being updated
   * - NOT_FOUND if the clan or role could not be found
   */
  async updateOneById(
    roleToUpdate: UpdateClanRoleDto,
    clan_id: string | ObjectId,
  ): Promise<IServiceReturn<true>> {
    const [clan, clanReadingErrors] = await this.clanService.readOneById<Clan>(
      clan_id.toString(),
    );

    if (clanReadingErrors) return [null, clanReadingErrors];

    const [role, roleNotExistsErrors] = this.findRoleFromRoles(
      roleToUpdate._id,
      clan.roles,
    );
    if (roleNotExistsErrors) return [null, roleNotExistsErrors];

    const [, roleTypeErrors] = this.validateRoleType(role, [
      ClanRoleType.NAMED,
    ]);
    if (roleTypeErrors) return [null, roleTypeErrors];

    const clanRolesWithoutUpdating = clan.roles.filter(
      (role) => role._id.toString() !== roleToUpdate._id.toString(),
    );

    const [, uniquenessErrors] = this.validateClanRoleUniqueness(
      roleToUpdate,
      clanRolesWithoutUpdating,
    );
    if (uniquenessErrors) return [null, uniquenessErrors];

    await this.clanModel.updateOne(
      {
        _id: clan_id,
        'roles._id': roleToUpdate._id,
      },
      {
        $set: Object.fromEntries(
          Object.entries(roleToUpdate).map(([key, value]) => [
            `roles.$.${key}`,
            value,
          ]),
        ),
      },
    );

    return [true, null];
  }

  /**
   * Deletes a ClanRole by its _id from DB.
   * @param clan_id - The Mongo _id of the Clan where from the role to delete.
   * @param role_id - The Mongo _id of the ClanRole to delete.
   * @returns _true_ if ClanRole was removed successfully,
   * or a ServiceError array if the ClanRole was not found or something else went wrong
   */
  async deleteOneById(
    clan_id: string | ObjectId,
    role_id: string | ObjectId,
  ): Promise<[true | null, ServiceError[] | null]> {
    const [clan] = await this.clanService.readOneById<Clan>(clan_id.toString());

    const [roleToDelete, roleExistenceErrors] = this.findRoleFromRoles(
      role_id,
      clan.roles,
    );

    if (roleExistenceErrors) return [null, roleExistenceErrors];

    const [isValidDefault, errorDefault] = this.validateRoleType(roleToDelete, [
      ClanRoleType.NAMED,
    ]);
    if (!isValidDefault) return [isValidDefault, errorDefault];

    await this.clanModel.updateOne(
      { _id: clan_id },
      { $pull: { roles: { _id: role_id } } },
    );
    return [true, null];
  }

  /**
   * Sets a role to a specified player. Notice that the role must be of type default or named.
   *
   * @param setData payload for setting clan role
   *
   * @returns true if role is set or ServiceErrors:
   * - NOT_FOUND if the player is not found, player is not in any clan or if the clan or role is not found
   * - NOT_ALLOWED if the role is of type personal
   */
  async setRoleToPlayer(
    setData: SetClanRoleDto,
  ): Promise<IServiceReturn<true>> {
    const [player, playerReadErrors] =
      await this.playerService.readOneById<PlayerDto>(
        setData.player_id.toString(),
      );
    if (playerReadErrors)
      return [
        null,
        [new ServiceError({ ...playerReadErrors[0], field: 'player_id' })],
      ];

    if (!player.clan_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'clan_id',
            value: player.clan_id,
            message: 'Player is not in any clan',
          }),
        ],
      ];

    const [clan, clanReadErrors] = await this.clanService.readOneById<Clan>(
      player.clan_id,
    );

    if (clanReadErrors) return [null, clanReadErrors];

    const [roleToSet, roleErrors] = this.findRoleFromRoles(
      setData.role_id.toString(),
      clan.roles,
    );

    if (roleErrors)
      return [null, [new ServiceError({ ...roleErrors[0], field: 'role_id' })]];

    const [, roleTypeErrors] = this.validateRoleType(roleToSet, [
      ClanRoleType.NAMED,
      ClanRoleType.DEFAULT,
    ]);

    if (roleTypeErrors) return [null, roleTypeErrors];

    const [voting, votingErrors] = await this.votingService.startVoting({
      voterPlayer: player,
      type: VotingType.SET_CLAN_ROLE,
      clanId: player.clan_id.toString(),
      setClanRole: setData,
      queue: VotingQueueName.CLAN_ROLE,
      endsOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });
    if (votingErrors) return [null, votingErrors];

    await this.votingQueue.addVotingCheckJob({
      voting,
      queue: VotingQueueName.CLAN_ROLE,
    });

    return [true, null];
  }

  /**
   * Validates clan role uniqueness (its name and rights)
   * @param roleToValidate role to validate
   * @param roles role array, where to check
   * @private
   *
   * @returns true if the role is unique or ServiceErrors if any found
   */
  private validateClanRoleUniqueness(
    roleToValidate: Partial<ClanRole>,
    roles: ClanRole[],
  ): IServiceReturn<true> {
    if (isRoleNameExists(roles, roleToValidate.name))
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_UNIQUE,
            field: 'name',
            value: roleToValidate.name,
            message: 'Role with this name already exists',
          }),
        ],
      ];

    if (doesRoleWithRightsExists(roles, roleToValidate.rights))
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_UNIQUE,
            field: 'rights',
            value: roleToValidate.rights,
            message: 'Role with the same rights already exists',
          }),
        ],
      ];
    return [true, null];
  }

  /**
   * Validates that the role is of specified type
   * @param roleToValidate role to validate
   * @param allowedTypes role types
   * @private
   * @returns true if its type of specified type or ServiceError NOT_ALLOWED if not
   */
  private validateRoleType(
    roleToValidate: Partial<ClanRole>,
    allowedTypes: ClanRoleType[],
  ): IServiceReturn<true> {
    if (!allowedTypes.includes(roleToValidate.clanRoleType)) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            field: 'clanRoleType',
            value: roleToValidate.clanRoleType,
            message: `Can process only role with type ${allowedTypes.toString()}`,
          }),
        ],
      ];
    }

    return [true, null];
  }

  /**
   * Finds a role from a specified array of roles by _id
   * @param role_id _id of the role to find
   * @param roles where to search
   * @private
   * @returns found role or ServiceError NOT_FOUND if the role was not found
   */
  private findRoleFromRoles(
    role_id: string | ObjectId,
    roles: ClanRole[],
  ): IServiceReturn<ClanRole> {
    const foundRole = roles.find(
      (role) => role._id.toString() === role_id.toString(),
    );
    if (!foundRole)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: '_id',
            value: role_id.toString(),
            message: 'Role with this _id is not found',
          }),
        ],
      ];

    return [foundRole, null];
  }

  /**
   * Handles the expiration of a voting process by checking if the vote passed,
   * updating the player's clan role if successful, and removing the voting record.
   *
   * @param params - The parameters containing the voting object to process.
   * @returns True or ServiceErrors if updating the role or deleting the voting fails.
   */
  async checkVotingOnExpire(params: VotingQueueParams) {
    const { voting } = params;

    const votePassed = await this.votingService.checkVotingSuccess(voting);
    if (votePassed) {
      const [, updateErrors] = await this.playerService.updateOneById(
        voting.setClanRole.player_id.toString(),
        { clanRole_id: new ObjectId(voting.setClanRole.role_id) },
      );

      if (updateErrors) return [null, updateErrors];
    }

    const [, deleteErrors] =
      await this.votingService.basicService.deleteOneById(voting._id);

    if (deleteErrors) return [null, deleteErrors];

    return [true, null];
  }
}
