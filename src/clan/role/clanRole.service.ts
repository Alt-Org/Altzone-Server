import { Injectable, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Clan } from '../clan.schema';
import { Model, Connection } from 'mongoose';
import BasicService from '../../common/service/basicService/BasicService';
import { ClanRole } from './ClanRole.schema';
import { ClanService } from '../clan.service';
import { ObjectId } from 'mongodb';
import { IServiceReturn } from '../../common/service/basicService/IService';
import { CreateClanRoleDto } from './dto/createClanRole.dto';
import { ClanDto } from '../dto/clan.dto';
import { doesRoleWithRightsExists, isRoleNameExists } from './clanRoleUtils';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import {
  cancelTransaction,
  endTransaction,
  initializeSession,
} from '../../common/function/Transactions';
import GameEventEmitter from '../../gameEventsEmitter/gameEventEmitter';
import { ClanRoleType } from './enum/clanRoleType.enum';
import { UpdateClanRoleDto } from './dto/updateClanRole.dto';
import { UpdateClanDto } from '../dto/updateClan.dto';
import { ClanGovernanceUpdateDto } from '../dto/clanGovernanceUpdate.dto';
import SetClanRoleDto from './dto/setClanRole.dto';
import { Player } from '../../player/schemas/player.schema';
import { VotingService } from '../../voting/voting.service';
import { PlayerDto } from '../../player/dto/player.dto';
import { VotingType } from '../../voting/enum/VotingType.enum';
import { VotingQueue } from '../../voting/voting.queue';
import { VotingQueueName } from '../../voting/enum/VotingQueue.enum';
import { VotingDto } from '../../voting/dto/voting.dto';
import { GovernancePayload } from '../../voting/type/governancePayload';
import { VoteChoice } from '../../voting/enum/choiceType.enum';

@Injectable()
export default class ClanRoleService {
  public constructor(
    @Optional()
    @InjectModel(ClanRole.name)
    private readonly clanRoleModel: Model<ClanRole>,
    @InjectModel(Clan.name) private readonly clanModel: Model<Clan>,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
    @Inject(forwardRef(() => ClanService))
    private readonly clanService: ClanService,
    @InjectConnection() private readonly connection: Connection,
    @Optional()
    private readonly votingService: VotingService,
    @Optional()
    private readonly votingQueue: VotingQueue,
    private readonly emitter: GameEventEmitter,
  ) {
    if (clanModel) this.clanBasicService = new BasicService(clanModel);
    if (playerModel) this.playerBasicService = new BasicService(playerModel);
  }

  public readonly clanBasicService: BasicService;
  public readonly playerBasicService: BasicService;

  async createOne(
    roleToCreate: CreateClanRoleDto,
    clan_id: string | ObjectId,
  ): Promise<IServiceReturn<ClanRole>> {
    const [clan, clanReadingErrors] = await this.clanBasicService.readOneById(
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
    const [, clanUpdateErrors] = await this.clanBasicService.updateOneById(
      clan_id.toString(),
      {
        $push: { roles: [newRole] },
      },
    );

    if (clanUpdateErrors) return [null, clanUpdateErrors];

    const [updatedClan] = await this.clanBasicService.readOneById<Clan>(
      clan_id.toString(),
    );
    const createdRole = updatedClan.roles.find(
      (role) => role.name === newRole.name,
    );

    return [createdRole, null];
  }

  async updateOneById(
    roleToUpdate: UpdateClanRoleDto,
    clan_id: string | ObjectId,
  ): Promise<IServiceReturn<true>> {
    const [clan, clanReadingErrors] =
      await this.clanBasicService.readOneById<Clan>(clan_id.toString());

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

  public async applyGovernance(
    clanId: string,
    body: UpdateClanDto,
    payload: GovernancePayload,
  ): Promise<IServiceReturn<boolean>> {
    if (!this.clanRoleModel || !this.votingQueue) {
      return [true, null];
    }

    const [session, initErrors] = await initializeSession(this.connection);
    if (!session) return [null, initErrors];

    const [clan, clanErrors] =
      await this.clanBasicService.readOneById<ClanDto>(clanId);
    if (clanErrors || !clan)
      return await cancelTransaction(session, clanErrors);

    const [playersInClan, adminErrors] = await this.calculateNewAdmins(
      clanId,
      clan.admin_ids,
      payload.admin_idsToAdd,
      payload.admin_idsToDelete,
    );

    if (adminErrors) return await cancelTransaction(session, adminErrors);

    const fieldsToUpdate: ClanGovernanceUpdateDto = {
      admin_ids: playersInClan,
    };
    if (payload.roles) fieldsToUpdate.roles = payload.roles;

    const [result, updateErrors] = await this.clanBasicService.updateOneById(
      clanId,
      fieldsToUpdate,
      { session },
    );
    if (updateErrors) return await cancelTransaction(session, updateErrors);

    const [finalResult, commitError] = await endTransaction<boolean>(
      session,
      result,
    );
    if (commitError) return [null, commitError];

    this.emitter.emitAsync('clan.update', { clan_id: clanId });
    return [finalResult, null];
  }

  public async startGovernanceVoting(
    clanToUpdate: UpdateClanDto,
    voterPlayer: PlayerDto,
  ): Promise<IServiceReturn<boolean>> {
    const [voting, error] = await this.votingService.startVoting({
      clanId: clanToUpdate._id,
      voterPlayer: voterPlayer,
      type: VotingType.CLAN_GOVERNANCE_UPDATE,
      governancePayload: {
        roles: clanToUpdate.roles ?? [],
        admin_idsToAdd: clanToUpdate.admin_idsToAdd ?? [],
        admin_idsToDelete: clanToUpdate.admin_idsToDelete ?? [],
      },
      queue: VotingQueueName.CLAN_ROLE,
      endsOn: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    if (error) return [null, error];

    await this.votingQueue.addVotingCheckJob({
      voting,
      queue: VotingQueueName.CLAN_ROLE,
    });

    return [true, null];
  }

  public async calculateNewAdmins(
    clanId: string,
    currentAdminIds: string[],
    toAdd?: string[],
    toDelete?: string[],
  ): Promise<IServiceReturn<string[]>> {
    let admin_ids = (currentAdminIds || []).map((id) => String(id).trim());

    if (toDelete) {
      const deleteIds = toDelete.map((id) => String(id).trim());
      admin_ids = admin_ids.filter((id) => !deleteIds.includes(id));
    }

    if (toAdd) {
      const addIds = toAdd.map((id) => String(id).trim());
      admin_ids = Array.from(new Set([...admin_ids, ...addIds]));
    }

    const playersInClan: string[] = [];
    for (const p_id of admin_ids) {
      const [player, pErrors] =
        await this.playerBasicService.readOneById<PlayerDto>(p_id);
      if (pErrors || !player || String(player.clan_id) !== String(clanId))
        continue;
      playersInClan.push(p_id);
    }

    if (playersInClan.length === 0) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'admin_ids',
            message: 'Clan must have at least one admin',
          }),
        ],
      ];
    }

    return [playersInClan, null];
  }

  async deleteOneById(
    clan_id: string | ObjectId,
    role_id: string | ObjectId,
  ): Promise<[true | null, ServiceError[] | null]> {
    const [clan] = await this.clanBasicService.readOneById<Clan>(
      clan_id.toString(),
    );

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

  async setRoleToPlayer(
    setData: SetClanRoleDto,
    voterPlayer: PlayerDto,
  ): Promise<IServiceReturn<true>> {
    const [player, playerReadErrors] =
      await this.playerBasicService.readOneById<PlayerDto>(
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

    if (!voterPlayer?.clan_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'voterPlayer.clan_id',
            value: voterPlayer?.clan_id,
            message: 'Voting organizer must be a member of a clan',
          }),
        ],
      ];

    if (player.clan_id.toString() !== voterPlayer.clan_id.toString())
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_AUTHORIZED,
            field: 'player_id',
            value: setData.player_id,
            message: 'Role can be set only for a player in the same clan',
          }),
        ],
      ];

    const [clan, clanReadErrors] =
      await this.clanBasicService.readOneById<Clan>(player.clan_id);
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
      voterPlayer,
      type: VotingType.SET_CLAN_ROLE,
      clanId: voterPlayer.clan_id.toString(),
      setClanRole: setData,
      queue: VotingQueueName.CLAN_ROLE,
      endsOn: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    if (votingErrors) return [null, votingErrors];

    await this.votingQueue.addVotingCheckJob({
      voting,
      queue: VotingQueueName.CLAN_ROLE,
    });

    return [true, null];
  }

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

  public isGovernanceAction(clanToUpdate: UpdateClanDto): boolean {
    return (
      !!clanToUpdate.roles ||
      (!!clanToUpdate.admin_idsToAdd &&
        clanToUpdate.admin_idsToAdd.length > 0) ||
      (!!clanToUpdate.admin_idsToDelete &&
        clanToUpdate.admin_idsToDelete.length > 0)
    );
  }

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
   * Handles the process when a buy voting has passed
   *
   * @param voting - The voting data.
   *
   * @throws ServiceError if the voting data is missing required fields or if there is an error updating the player's clan role.
   */
  async checkVotingOnExpire(voting: VotingDto): Promise<IServiceReturn<true>> {
    const votePassed = await this.votingService.checkVotingSuccess(
      voting,
      true,
    );
    
    if (!votePassed) {
      return [true, null];
    }

    if (!voting.setClanRole?.player_id || !voting.setClanRole?.role_id) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'setClanRole',
            value: voting.setClanRole,
            message:
              'Voting is missing player_id or role_id for clan role update',
          }),
        ],
      ];
    }

    const [, updateErrors] = await this.playerBasicService.updateOneById(
      voting.setClanRole.player_id.toString(),
      { clanRole_id: new ObjectId(voting.setClanRole.role_id.toString()) },
    );
    if (updateErrors) return [null, updateErrors];

    await this.votingService.finalizeVoting(voting._id);

    return [true, null];
  }
}
