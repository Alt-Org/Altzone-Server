import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Types, UpdateQuery } from 'mongoose';
import { ClanService } from '../clan/clan.service';
import { RedisService } from '../common/service/redis/redis.service';
import { CacheKeys } from '../common/service/redis/cacheKeys.enum';
import { MqttNotificationType } from '../common/service/notificator/enum/MqttNotificationType.enum';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { IServiceReturn } from '../common/service/basicService/IService';
import { PlayerService } from '../player/player.service';
import { CreateMatchmakingInviteDto } from './dto/createMatchmakingInvite.dto';
import { FinishMatchDto } from './dto/finishMatch.dto';
import { JoinMatchmakingInviteDto } from './dto/joinMatchmakingInvite.dto';
import { MatchmakingInviteDto } from './dto/matchmakingInvite.dto';
import { MatchmakingRoomInviteDto } from './dto/matchmakingRoomInvite.dto';
import {
  MatchmakingMatchBotParticipantDto,
  MatchmakingMatchDto,
  MatchmakingPlayerParticipantDto,
  MatchmakingTeamDto,
} from './dto/matchmakingMatch.dto';
import { InviteStatus } from './enum/inviteStatus.enum';
import { MatchStatus } from './enum/matchStatus.enum';
import { MatchType } from './enum/matchType.enum';
import { TeamSide } from './enum/teamSide.enum';
import { MatchmakingNotifier } from './matchmaking.notifier';
import { MatchmakingQueue } from './matchmaking.queue';
import { ActiveMatch } from './type/activeMatch.type';
import { MatchmakingInvite } from './type/matchmakingInvite.type';
import {
  MatchmakingBotParticipant,
  MatchmakingParticipant,
  MatchmakingPlayerParticipant,
} from './type/matchmakingParticipant.type';
import { MatchmakingTeam } from './type/matchmakingTeam.type';
import { Clan } from '../clan/clan.schema';

/**
 * Orchestrates matchmaking state transitions.
 *
 * Redis owns the short-lived invite, queue, and active match state while
 * Mongo-backed services provide durable player and clan data. This service keeps
 * those concerns together so controllers, workers, and notifiers stay thin.
 */
@Injectable()
export class MatchmakingService {
  // Redis lifetimes and scoring constants used across the matchmaking flow.
  private readonly INVITE_TTL_S = 5 * 60;
  private readonly CANCELLED_INVITE_TTL_S = 60;
  private readonly FINISHED_MATCH_TTL_S = 10 * 60;
  private readonly WIN_BATTLE_POINTS = 50;
  private readonly LOSS_BATTLE_POINTS = 10;
  private readonly CLAN_OPPONENT_TIMEOUT_S = 30;
  private readonly INVITE_KEY_PREFIX = 'matchmaking:invite';
  private readonly PLAYER_INVITE_KEY_PREFIX = 'matchmaking:player-invite';
  private readonly QUEUE_KEY_PREFIX = 'matchmaking:queue';
  private readonly MATCH_KEY_PREFIX = 'matchmaking:match';
  private readonly PLAYER_MATCH_KEY_PREFIX = 'matchmaking:match-player';
  private readonly MATCH_LEADERBOARD_LOCK_KEY_PREFIX =
    'matchmaking:leaderboard-lock';

  constructor(
    private readonly redisService: RedisService,
    private readonly playerService: PlayerService,
    private readonly clanService: ClanService,
    private readonly notifier: MatchmakingNotifier,
    @Inject(forwardRef(() => MatchmakingQueue))
    private readonly queue: MatchmakingQueue,
  ) {}

  /**
   * Creates an invite from the authenticated player. Ready invites wait for the
   * room owner to explicitly start matchmaking.
   */
  async createInvite(
    playerId: string,
    body: CreateMatchmakingInviteDto,
  ): Promise<IServiceReturn<MatchmakingInviteDto>> {
    const [player, playerErrors] =
      await this.playerService.getPlayerById(playerId);
    if (playerErrors) return [null, playerErrors as ServiceError[]];

    const activeInviteErrors =
      await this.validatePlayerHasNoActiveInvite(playerId);
    if (activeInviteErrors) return [null, activeInviteErrors];

    const configErrors = await this.validateCreateInviteBody(playerId, body);
    if (configErrors) return [null, configErrors];

    const now = new Date().toISOString();
    const invite: MatchmakingInvite = this.recalculateInvite({
      id: new Types.ObjectId().toString(),
      matchType: body.matchType,
      status: InviteStatus.OPEN,
      ownerPlayerId: playerId,
      clanId:
        body.matchType === MatchType.CLAN
          ? player.clan_id?.toString()
          : undefined,
      roomId: body.roomId,
      players: [playerId],
      bots: [],
      teamSize: this.resolveTeamSize(body),
      allowBots: this.resolveAllowBots(body),
      createdAt: now,
      updatedAt: now,
    });

    await this.saveInvite(invite);
    await this.setPlayerInvite(playerId, invite.id);
    await this.notifyInvitePlayers(invite);

    return [this.toInviteDto(invite), null];
  }

  /**
   * Returns invites the player is allowed to see.
   *
   * The filter keeps cancelled and already matched invites hidden, while exposing
   * own invites, joined invites, custom rooms, and same-clan CLAN invites.
   */
  async getInvites(
    playerId: string,
  ): Promise<IServiceReturn<MatchmakingInviteDto[]>> {
    const [player, playerErrors] =
      await this.playerService.getPlayerById(playerId);
    if (playerErrors) return [null, playerErrors as ServiceError[]];

    const invites = await this.getAllInvites();
    const clanId = player.clan_id?.toString();
    const visibleInvites = invites.filter((invite) => {
      if (invite.status === InviteStatus.CANCELLED) return false;
      if (invite.status === InviteStatus.MATCHED) return false;
      if (invite.players.includes(playerId)) return true;
      if (invite.ownerPlayerId === playerId) return true;
      if (invite.matchType === MatchType.CUSTOM) return true;
      if (invite.matchType === MatchType.CLAN && invite.clanId === clanId) {
        return true;
      }

      return false;
    });

    return [visibleInvites.map((invite) => this.toInviteDto(invite)), null];
  }

  /**
   * Reads a single invite from Redis and maps it to the public DTO.
   */
  async getInvite(
    inviteId: string,
  ): Promise<IServiceReturn<MatchmakingInviteDto>> {
    const [invite, inviteErrors] = await this.readInvite(inviteId);
    if (inviteErrors) return [null, inviteErrors];

    return [this.toInviteDto(invite), null];
  }

  /**
   * Joins a player into an invite, applying mode-specific validation before the
   * invite is recalculated and potentially moved into matchmaking.
   */
  async joinInvite(
    inviteId: string,
    playerId: string,
    body: JoinMatchmakingInviteDto,
  ): Promise<IServiceReturn<MatchmakingInviteDto>> {
    const [invite, inviteErrors] = await this.readInvite(inviteId);
    if (inviteErrors) return [null, inviteErrors];

    if (invite.players.includes(playerId)) {
      return [this.toInviteDto(invite), null];
    }

    const [player, playerErrors] =
      await this.playerService.getPlayerById(playerId);
    if (playerErrors) return [null, playerErrors as ServiceError[]];

    const activeInviteErrors =
      await this.validatePlayerHasNoActiveInvite(playerId);
    if (activeInviteErrors) return [null, activeInviteErrors];

    const joinErrors = this.validateJoinInvite(invite, playerId, body);
    if (joinErrors) return [null, joinErrors];

    if (
      invite.matchType === MatchType.CLAN &&
      invite.clanId !== player.clan_id?.toString()
    ) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            field: 'clan_id',
            value: player.clan_id,
            message: 'Player must belong to the same clan as the invite.',
          }),
        ],
      ];
    }

    const updatedInvite = this.recalculateInvite({
      ...this.makeRoomForPlayer(invite),
      players: [...invite.players, playerId],
      updatedAt: new Date().toISOString(),
    });

    await this.saveInvite(updatedInvite);
    await this.setPlayerInvite(playerId, updatedInvite.id);
    await this.notifyInvitePlayers(updatedInvite);

    return [this.toInviteDto(updatedInvite), null];
  }

  /**
   * Starts matchmaking for a ready room. Only the room owner may move a room
   * from READY into matchmaking.
   */
  async startRoom(
    roomId: string,
    playerId: string,
  ): Promise<IServiceReturn<MatchmakingInviteDto>> {
    const [invite, inviteErrors] = await this.readInvite(roomId);
    if (inviteErrors) return [null, inviteErrors];

    if (invite.ownerPlayerId !== playerId) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_AUTHORIZED,
            field: 'playerId',
            value: playerId,
            message: 'Only the room owner can start matchmaking.',
          }),
        ],
      ];
    }

    if (invite.status !== InviteStatus.READY) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            field: 'status',
            value: invite.status,
            message: 'Room is not ready to start matchmaking.',
          }),
        ],
      ];
    }

    const processedInvite = await this.processReadyInvite(invite);

    return [this.toInviteDto(processedInvite), null];
  }

  /**
   * Validates that the sender can invite one specific player to their active
   * matchmaking room.
   */
  async sendPlayerInvite(
    targetPlayerId: string,
    senderPlayerId: string,
  ): Promise<IServiceReturn<MatchmakingInviteDto>> {
    const [invite, inviteErrors] =
      await this.getOwnedActiveInvite(senderPlayerId);
    if (inviteErrors) return [null, inviteErrors];

    const [targetPlayer, targetPlayerErrors] =
      await this.playerService.getPlayerById(targetPlayerId);
    if (targetPlayerErrors) {
      return [null, targetPlayerErrors as ServiceError[]];
    }

    if (!targetPlayer) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'playerId',
            value: targetPlayerId,
            message: 'Invited player not found.',
          }),
        ],
      ];
    }

    const targetErrors = this.validateInviteTarget(invite, targetPlayerId);
    if (targetErrors) return [null, targetErrors];

    await this.notifier.inviteReceived(
      targetPlayerId,
      MqttNotificationType.INVITE_RECEIVED,
      this.toRoomInviteDto(invite, senderPlayerId),
    );

    return [this.toInviteDto(invite), null];
  }

  /**
   * Validates that the sender can invite their clan members to their active
   * matchmaking room.
   */
  async sendClanInvite(
    senderPlayerId: string,
  ): Promise<IServiceReturn<MatchmakingInviteDto>> {
    const [invite, inviteErrors] =
      await this.getOwnedActiveInvite(senderPlayerId);
    if (inviteErrors) return [null, inviteErrors];

    const [senderPlayer, senderPlayerErrors] =
      await this.playerService.getPlayerById(senderPlayerId);
    if (senderPlayerErrors) {
      return [null, senderPlayerErrors as ServiceError[]];
    }

    const clanId = senderPlayer.clan_id?.toString();
    if (!clanId) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'clan_id',
            value: senderPlayer.clan_id,
            message: 'Clan invite requires the sender to belong to a clan.',
          }),
        ],
      ];
    }

    const [clanPlayers, clanPlayerErrors] =
      await this.playerService.basicService.readMany({
        filter: { clan_id: clanId },
        select: ['_id'],
      });
    if (clanPlayerErrors) return [null, clanPlayerErrors];

    const targetPlayerIds = (clanPlayers ?? [])
      .map((player) => player._id?.toString())
      .filter(
        (playerId): playerId is string =>
          Boolean(playerId) &&
          playerId !== senderPlayerId &&
          !invite.players.includes(playerId),
      );

    if (targetPlayerIds.length === 0) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'clan_id',
            value: clanId,
            message: 'No clan members available to invite.',
          }),
        ],
      ];
    }

    const roomInvite = this.toRoomInviteDto(invite, senderPlayerId);
    await Promise.all(
      targetPlayerIds.map((targetPlayerId) =>
        this.notifier.inviteReceived(
          targetPlayerId,
          MqttNotificationType.CLAN_INVITE_RECEIVED,
          roomInvite,
        ),
      ),
    );

    return [this.toInviteDto(invite), null];
  }

  /**
   * Cancels an invite owned by the caller and removes its player/index records.
   */
  async cancelInvite(
    inviteId: string,
    playerId: string,
  ): Promise<IServiceReturn<void>> {
    const [invite, inviteErrors] = await this.readInvite(inviteId);
    if (inviteErrors) return [null, inviteErrors];

    if (invite.status === InviteStatus.MATCHED) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            field: 'status',
            value: invite.status,
            message: 'A matched invite can no longer be cancelled.',
          }),
        ],
      ];
    }

    if (invite.ownerPlayerId !== playerId) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_AUTHORIZED,
            field: 'playerId',
            value: playerId,
            message: 'Only the invite owner can cancel the invite.',
          }),
        ],
      ];
    }

    const cancelledInvite: MatchmakingInvite = {
      ...invite,
      status: InviteStatus.CANCELLED,
      updatedAt: new Date().toISOString(),
    };

    await this.removeInviteFromQueue(invite);
    await this.saveInvite(cancelledInvite, this.CANCELLED_INVITE_TTL_S);
    await Promise.all(
      invite.players.map((invitePlayerId) =>
        this.redisService.delete(this.playerInviteKey(invitePlayerId)),
      ),
    );
    await this.notifyInvitePlayers(cancelledInvite);

    return [null, null];
  }

  /**
   * Finishes an active match once, updates the correct leaderboards, and keeps
   * the completed match briefly available in Redis for clients that refresh.
   */
  async finishMatch(
    matchId: string,
    playerId: string,
    body: FinishMatchDto,
  ): Promise<IServiceReturn<MatchmakingMatchDto>> {
    const [match, matchErrors] = await this.readMatch(matchId);
    if (matchErrors) return [null, matchErrors];

    if (!this.matchHasPlayer(match, playerId)) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_AUTHORIZED,
            field: 'playerId',
            value: playerId,
            message: 'Only match participants can finish the match.',
          }),
        ],
      ];
    }

    if (match.status === MatchStatus.FINISHED) {
      return [this.toMatchDto(match), null];
    }

    const lockAcquired = await this.redisService.setNx(
      this.matchLeaderboardLockKey(matchId),
      '1',
      this.FINISHED_MATCH_TTL_S,
    );

    if (!lockAcquired) {
      const [latestMatch] = await this.readMatch(matchId);
      if (latestMatch?.status === MatchStatus.FINISHED) {
        return [this.toMatchDto(latestMatch), null];
      }

      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            field: 'matchId',
            value: matchId,
            message: 'Match finish is already being processed.',
          }),
        ],
      ];
    }

    const finishedMatch: ActiveMatch = {
      ...match,
      status: MatchStatus.FINISHED,
      finishedAt: new Date().toISOString(),
      result: { winningSide: body.winningSide },
    };

    const leaderboardErrors =
      await this.updateLeaderboardsForFinishedMatch(finishedMatch);
    if (leaderboardErrors) return [null, leaderboardErrors];

    await this.saveFinishedMatch(finishedMatch);
    await this.invalidateLeaderboardCaches();
    await this.notifier.matchEvent(
      finishedMatch.id,
      'MATCH_FINISHED',
      this.toMatchDto(finishedMatch),
    );

    return [this.toMatchDto(finishedMatch), null];
  }

  /**
   * Confirms that a real match participant has joined the Photon Room. Once all
   * real players have confirmed, the clientside battle can start.
   */
  async startMatch(
    matchId: string,
    playerId: string,
  ): Promise<IServiceReturn<MatchmakingMatchDto>> {
    const [match, matchErrors] = await this.readMatch(matchId);
    if (matchErrors) return [null, matchErrors];

    if (match.status !== MatchStatus.ACTIVE) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            field: 'matchId',
            value: matchId,
            message: 'Only active matchmaking matches can be started.',
          }),
        ],
      ];
    }

    if (!this.matchHasPlayer(match, playerId)) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_AUTHORIZED,
            field: 'playerId',
            value: playerId,
            message: 'Only match participants can start the match.',
          }),
        ],
      ];
    }

    const requiredPlayerIds = Array.from(new Set(this.getRealPlayerIds(match)));
    const readyPlayerIds = Array.from(
      new Set([
        ...(match.readyPlayerIds ?? []).filter((readyPlayerId) =>
          requiredPlayerIds.includes(readyPlayerId),
        ),
        playerId,
      ]),
    );
    const allPlayersReady = requiredPlayerIds.every((requiredPlayerId) =>
      readyPlayerIds.includes(requiredPlayerId),
    );
    const startedMatch: ActiveMatch = {
      ...match,
      readyPlayerIds,
      battleStartedAt:
        match.battleStartedAt ??
        (allPlayersReady ? new Date().toISOString() : undefined),
    };

    await this.saveMatch(startedMatch);

    if (allPlayersReady && !match.battleStartedAt) {
      await this.notifier.matchEvent(
        startedMatch.id,
        MqttNotificationType.MATCH_STARTED,
        this.toMatchDto(startedMatch),
      );
    }

    return [this.toMatchDto(startedMatch), null];
  }

  /**
   * Validates that a battle/start request belongs to an active matchmaking match.
   */
  async validateBattleStart(
    matchId: string,
    requesterPlayerId: string,
    team1: string[],
    team2: string[],
  ) {
    const [match, matchErrors] = await this.readMatch(matchId);
    if (matchErrors) return matchErrors;

    if (match.status !== MatchStatus.ACTIVE) {
      return [
        new ServiceError({
          reason: SEReason.NOT_ALLOWED,
          field: 'matchId',
          value: matchId,
          message: 'Only active matchmaking matches can start battles.',
        }),
      ];
    }

    if (!this.matchHasPlayer(match, requesterPlayerId)) {
      return [
        new ServiceError({
          reason: SEReason.NOT_AUTHORIZED,
          field: 'playerId',
          value: requesterPlayerId,
          message: 'Only match participants can start a battle for the match.',
        }),
      ];
    }

    const [matchTeam1, matchTeam2] = match.teams.map((team) =>
      this.getTeamPlayerIds(team),
    );
    if (
      !this.haveSameMembers(matchTeam1, team1) ||
      !this.haveSameMembers(matchTeam2, team2)
    ) {
      return [
        new ServiceError({
          reason: SEReason.VALIDATION,
          field: 'teams',
          message:
            'Battle teams must match the active matchmaking match teams.',
        }),
      ];
    }

    return null;
  }

  /**
   * Routes READY invites into their mode-specific next step.
   *
   * RANDOM tries to pair any two ready teams, CLAN searches for another clan and
   * schedules a timeout fallback, and CUSTOM starts directly from room settings.
   */
  private async processReadyInvite(invite: MatchmakingInvite) {
    if (invite.status !== InviteStatus.READY) return invite;

    if (invite.matchType === MatchType.RANDOM) {
      const queuedInvite = await this.enqueueReadyInvite(invite);
      const match = await this.tryCreateRandomMatch();
      if (!match) return queuedInvite;

      const [processedInvite] = await this.readInvite(invite.id);

      return processedInvite ?? queuedInvite;
    }

    if (invite.matchType === MatchType.CLAN) {
      const queuedInvite = await this.enqueueReadyInvite(invite);
      const match = await this.tryCreateClanMatch(queuedInvite);
      if (match) {
        const [processedInvite] = await this.readInvite(invite.id);

        return processedInvite ?? queuedInvite;
      }

      await this.queue.scheduleClanOpponentTimeout(
        queuedInvite.id,
        this.CLAN_OPPONENT_TIMEOUT_S,
      );

      return queuedInvite;
    }

    if (invite.matchType === MatchType.CUSTOM) {
      const match = await this.createCustomMatch(invite);
      await this.markInviteMatched(invite, match.id);
      await this.notifyMatchPlayers(match);

      const [processedInvite] = await this.readInvite(invite.id);

      return processedInvite ?? invite;
    }

    return invite;
  }

  /**
   * Stores a READY invite in the Redis list for its match type if it is not
   * already queued.
   */
  private async enqueueReadyInvite(invite: MatchmakingInvite) {
    const queueKey = this.queueKey(invite.matchType);
    const queuedInvite: MatchmakingInvite = {
      ...invite,
      status: InviteStatus.QUEUED,
      updatedAt: new Date().toISOString(),
    };
    const queuedInviteIds = await this.redisService.lrange(queueKey, 0, -1);

    if (!queuedInviteIds.includes(invite.id)) {
      await this.redisService.rpush(queueKey, invite.id);
    }

    await this.saveInvite(queuedInvite);
    await this.notifyInvitePlayers(queuedInvite);

    return queuedInvite;
  }

  /**
   * Pairs the first two valid RANDOM invites from the queue into an active match.
   */
  private async tryCreateRandomMatch() {
    const queuedInvites = await this.getValidQueuedInvites(MatchType.RANDOM);
    if (queuedInvites.length < 2) return null;

    const [firstInvite, secondInvite] = queuedInvites;
    const match = await this.createActiveMatch(firstInvite, secondInvite);

    await Promise.all([
      this.markInviteMatched(firstInvite, match.id),
      this.markInviteMatched(secondInvite, match.id),
      this.removeInviteFromQueue(firstInvite),
      this.removeInviteFromQueue(secondInvite),
    ]);

    await this.notifyMatchPlayers(match);

    return match;
  }

  /**
   * Looks for a queued CLAN opponent from a different clan and creates a match
   * when one is available.
   */
  private async tryCreateClanMatch(invite: MatchmakingInvite) {
    const queuedInvites = await this.getValidQueuedInvites(MatchType.CLAN);
    const opponent = queuedInvites.find(
      (candidate) =>
        candidate.id !== invite.id &&
        candidate.clanId &&
        invite.clanId &&
        candidate.clanId !== invite.clanId,
    );

    if (!opponent) return null;

    const match = await this.createActiveMatch(
      invite,
      opponent,
      MatchType.CLAN,
    );

    await Promise.all([
      this.markInviteMatched(invite, match.id),
      this.markInviteMatched(opponent, match.id),
      this.removeInviteFromQueue(invite),
      this.removeInviteFromQueue(opponent),
    ]);

    await this.notifyMatchPlayers(match);

    return match;
  }

  /**
   * Called by the BullMQ worker when the CLAN opponent wait window expires.
   *
   * If the invite is still READY, it receives a full bot opponent team.
   */
  async handleClanOpponentTimeout(inviteId: string) {
    const [invite] = await this.readInvite(inviteId);
    if (!invite) return;
    if (invite.matchType !== MatchType.CLAN) return;
    if (invite.status !== InviteStatus.QUEUED) return;

    const clanMatch = await this.tryCreateClanMatch(invite);
    if (clanMatch) return;

    const match = await this.createClanBotMatch(invite);

    await Promise.all([
      this.markInviteMatched(invite, match.id),
      this.removeInviteFromQueue(invite),
    ]);
    await this.notifyMatchPlayers(match);
  }

  /**
   * Loads queued invite ids, drops stale entries, and returns still-READY invites.
   */
  private async getValidQueuedInvites(matchType: MatchType) {
    const queueKey = this.queueKey(matchType);
    const queuedInviteIds = Array.from(
      new Set(await this.redisService.lrange(queueKey, 0, -1)),
    );
    const validInvites: MatchmakingInvite[] = [];

    for (const inviteId of queuedInviteIds) {
      const [invite] = await this.readInvite(inviteId);
      if (!invite) {
        await this.redisService.lrem(queueKey, 0, inviteId);
        continue;
      }

      const isValid =
        invite.matchType === matchType && invite.status === InviteStatus.QUEUED;
      if (!isValid) {
        await this.redisService.lrem(queueKey, 0, inviteId);
        continue;
      }

      validInvites.push(invite);
    }

    return validInvites;
  }

  /**
   * Builds and persists a two-team active match from two ready invites.
   */
  private async createActiveMatch(
    firstInvite: MatchmakingInvite,
    secondInvite: MatchmakingInvite,
    matchType = MatchType.RANDOM,
  ) {
    const now = new Date().toISOString();
    const match: ActiveMatch = {
      id: new Types.ObjectId().toString(),
      matchType,
      status: MatchStatus.ACTIVE,
      teamSize: firstInvite.teamSize,
      teams: [
        this.createTeam(firstInvite, TeamSide.A),
        this.createTeam(secondInvite, TeamSide.B),
      ],
      startedAt: now,
    };

    await this.saveActiveMatch(match);

    return match;
  }

  /**
   * Starts a CLAN match against a generated bot team after opponent timeout.
   */
  private async createClanBotMatch(invite: MatchmakingInvite) {
    const now = new Date().toISOString();
    const match: ActiveMatch = {
      id: new Types.ObjectId().toString(),
      matchType: MatchType.CLAN,
      status: MatchStatus.ACTIVE,
      teamSize: invite.teamSize,
      teams: [
        this.createTeam(invite, TeamSide.A),
        this.createBotTeam(invite.id, TeamSide.B, invite.teamSize),
      ],
      startedAt: now,
    };

    await this.saveActiveMatch(match);

    return match;
  }

  /**
   * Starts a CUSTOM match from one invite using the room-provided team size and
   * bot policy.
   */
  private async createCustomMatch(invite: MatchmakingInvite) {
    const now = new Date().toISOString();
    const teams = this.createCustomTeams(invite);
    const match: ActiveMatch = {
      id: new Types.ObjectId().toString(),
      matchType: MatchType.CUSTOM,
      status: MatchStatus.ACTIVE,
      teamSize: invite.teamSize,
      teams,
      startedAt: now,
    };

    await this.saveActiveMatch(match);

    return match;
  }

  /**
   * Splits custom room participants into deterministic left and right teams.
   */
  private createCustomTeams(
    invite: MatchmakingInvite,
  ): [MatchmakingTeam, MatchmakingTeam] {
    const participants = this.getInviteParticipants(invite);
    const teamA = participants.slice(0, invite.teamSize);
    const teamB = participants.slice(invite.teamSize, invite.teamSize * 2);

    return [
      { side: TeamSide.A, participants: teamA },
      { side: TeamSide.B, participants: teamB },
    ];
  }

  /**
   * Converts invite players and bots into match participants.
   */
  private getInviteParticipants(invite: MatchmakingInvite) {
    return [
      ...invite.players.map(
        (playerId): MatchmakingParticipant => ({
          playerId,
          isBot: false,
        }),
      ),
      ...invite.bots,
    ];
  }

  private createTeam(
    invite: MatchmakingInvite,
    side: TeamSide,
  ): MatchmakingTeam {
    return {
      side,
      clanId: invite.clanId,
      participants: [
        ...invite.players.map((playerId) => ({
          playerId,
          isBot: false as const,
        })),
        ...invite.bots,
      ],
    };
  }

  private createBotTeam(
    inviteId: string,
    side: TeamSide,
    teamSize: 1 | 2,
  ): MatchmakingTeam {
    return {
      side,
      participants: this.createBots(`${inviteId}:opponent`, teamSize),
    };
  }

  /**
   * Marks an invite as consumed by a match and notifies its real players.
   */
  private async markInviteMatched(invite: MatchmakingInvite, matchId: string) {
    const matchedInvite: MatchmakingInvite = {
      ...invite,
      status: InviteStatus.MATCHED,
      matchId,
      updatedAt: new Date().toISOString(),
    };

    await this.saveInvite(matchedInvite);
    await Promise.all(
      invite.players.map((playerId) =>
        this.redisService.delete(this.playerInviteKey(playerId)),
      ),
    );
    await this.notifyInvitePlayers(matchedInvite);
  }

  private async removeInviteFromQueue(invite: MatchmakingInvite) {
    await this.redisService.lrem(this.queueKey(invite.matchType), 0, invite.id);
  }

  /**
   * Persists the active match and creates reverse lookup keys for real players.
   */
  private async saveActiveMatch(match: ActiveMatch) {
    await this.redisService.set(this.matchKey(match.id), JSON.stringify(match));
    await Promise.all(
      this.getRealPlayerIds(match).map((playerId) =>
        this.redisService.set(this.playerMatchKey(playerId), match.id),
      ),
    );
  }

  /**
   * Persists updates to an existing active match without recreating reverse
   * player lookup keys.
   */
  private async saveMatch(match: ActiveMatch) {
    await this.redisService.set(this.matchKey(match.id), JSON.stringify(match));
  }

  /**
   * Sends per-player match-found events after a match is created.
   */
  private async notifyMatchPlayers(match: ActiveMatch) {
    const matchDto = this.toMatchDto(match);
    await Promise.all(
      this.getRealPlayerIds(match).map((playerId) =>
        this.notifier.matchFound(playerId, matchDto),
      ),
    );
  }

  private getRealPlayerIds(match: ActiveMatch) {
    return match.teams.flatMap((team) =>
      team.participants.flatMap((participant) =>
        this.isBotParticipant(participant) ? [] : [participant.playerId],
      ),
    );
  }

  /**
   * Updates personal leaderboards for all modes and clan leaderboards for CLAN
   * matches only.
   */
  private async updateLeaderboardsForFinishedMatch(match: ActiveMatch) {
    const playerErrors =
      await this.updatePlayerLeaderboardForFinishedMatch(match);
    if (playerErrors) return playerErrors;

    if (match.matchType !== MatchType.CLAN) return null;

    const clanErrors = await this.updateClanLeaderboardForFinishedMatch(match);
    if (clanErrors) return clanErrors;

    return null;
  }

  private async updatePlayerLeaderboardForFinishedMatch(match: ActiveMatch) {
    for (const team of match.teams) {
      const outcome = this.getTeamOutcome(team, match.result.winningSide);
      const battlePoints = this.getBattlePointsForOutcome(outcome);
      const playerIds = this.getTeamPlayerIds(team);

      for (const playerId of playerIds) {
        const increment: Record<string, number> = {
          battlePoints,
          'gameStatistics.playedBattles': 1,
        };

        if (outcome === 'WIN') {
          increment['gameStatistics.wonBattles'] = 1;
        }

        const [, updateErrors] = await this.playerService.updatePlayerById(
          playerId,
          { $inc: increment },
        );
        if (updateErrors) return updateErrors;
      }
    }

    return null;
  }

  private async updateClanLeaderboardForFinishedMatch(match: ActiveMatch) {
    for (const team of match.teams) {
      if (!team.clanId) continue;

      const outcome = this.getTeamOutcome(team, match.result.winningSide);
      const battlePoints = this.getBattlePointsForOutcome(outcome);
      const update: UpdateQuery<Clan> = { $inc: { battlePoints } };
      const [, updateErrors] =
        await this.clanService.basicService.updateOneById<UpdateQuery<Clan>>(
          team.clanId,
          update,
        );
      if (updateErrors) return updateErrors;
    }

    return null;
  }

  private getTeamOutcome(
    team: MatchmakingTeam,
    winningSide: TeamSide,
  ): 'WIN' | 'LOSS' {
    return team.side === winningSide ? 'WIN' : 'LOSS';
  }

  private getBattlePointsForOutcome(outcome: 'WIN' | 'LOSS') {
    if (outcome === 'WIN') return this.WIN_BATTLE_POINTS;

    return this.LOSS_BATTLE_POINTS;
  }

  private getTeamPlayerIds(team: MatchmakingTeam) {
    return team.participants.flatMap((participant) =>
      this.isBotParticipant(participant) ? [] : [participant.playerId],
    );
  }

  private haveSameMembers(first: string[], second: string[]) {
    if (first.length !== second.length) return false;

    const secondMembers = new Set(second);
    return first.every((value) => secondMembers.has(value));
  }

  private matchHasPlayer(match: ActiveMatch, playerId: string) {
    return this.getRealPlayerIds(match).includes(playerId);
  }

  /**
   * Reads an active or recently finished match from Redis.
   */
  private async readMatch(
    matchId: string,
  ): Promise<IServiceReturn<ActiveMatch>> {
    const matchRaw = await this.redisService.get(this.matchKey(matchId));
    if (!matchRaw) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'matchId',
            value: matchId,
            message: 'Matchmaking match not found.',
          }),
        ],
      ];
    }

    return [JSON.parse(matchRaw) as ActiveMatch, null];
  }

  /**
   * Re-saves a completed match and keeps per-player match lookups available
   * for the shorter finished-match TTL.
   */
  private async saveFinishedMatch(match: ActiveMatch) {
    await this.redisService.set(
      this.matchKey(match.id),
      JSON.stringify(match),
      this.FINISHED_MATCH_TTL_S,
    );
    await Promise.all(
      this.getRealPlayerIds(match).map((playerId) =>
        this.redisService.expire(
          this.playerMatchKey(playerId),
          this.FINISHED_MATCH_TTL_S,
        ),
      ),
    );
  }

  private async invalidateLeaderboardCaches() {
    await Promise.all([
      this.redisService.delete(CacheKeys.PLAYER_LEADERBOARD),
      this.redisService.delete(CacheKeys.CLAN_LEADERBOARD),
    ]);
  }

  /**
   * Validates mode-specific invite creation constraints before any Redis state is
   * created.
   */
  private async validateCreateInviteBody(
    playerId: string,
    body: CreateMatchmakingInviteDto,
  ) {
    if (body.matchType !== MatchType.CUSTOM && body.teamSize !== undefined) {
      return [
        new ServiceError({
          reason: SEReason.NOT_ALLOWED,
          field: 'teamSize',
          value: body.teamSize,
          message: 'Only CUSTOM invites may define teamSize.',
        }),
      ];
    }

    if (body.matchType === MatchType.CUSTOM && !body.roomId) {
      return [
        new ServiceError({
          reason: SEReason.REQUIRED,
          field: 'roomId',
          value: body.roomId,
          message: 'CUSTOM invites require roomId.',
        }),
      ];
    }

    if (body.matchType === MatchType.CLAN) {
      const clanId = await this.playerService.getPlayerClanId(playerId);
      if (!clanId) {
        return [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'clan_id',
            value: clanId,
            message: 'CLAN invites require the player to belong to a clan.',
          }),
        ];
      }

      const [, clanErrors] = await this.clanService.readOneById(clanId);
      if (clanErrors) return clanErrors;
    }

    return null;
  }

  /**
   * Loads the sender's active matchmaking room and verifies invite-sending
   * permissions.
   */
  private async getOwnedActiveInvite(
    senderPlayerId: string,
  ): Promise<IServiceReturn<MatchmakingInvite>> {
    const activeInviteId = await this.redisService.get(
      this.playerInviteKey(senderPlayerId),
    );

    if (!activeInviteId) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'playerId',
            value: senderPlayerId,
            message: 'Player does not have an active matchmaking room.',
          }),
        ],
      ];
    }

    const [invite, inviteErrors] = await this.readInvite(activeInviteId);
    if (inviteErrors) return [null, inviteErrors];

    if (invite.ownerPlayerId !== senderPlayerId) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_AUTHORIZED,
            field: 'playerId',
            value: senderPlayerId,
            message: 'Only the room owner can send matchmaking invites.',
          }),
        ],
      ];
    }

    if (
      invite.status === InviteStatus.CANCELLED ||
      invite.status === InviteStatus.MATCHED ||
      invite.status === InviteStatus.QUEUED
    ) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            field: 'status',
            value: invite.status,
            message: 'Room can no longer be used for matchmaking invites.',
          }),
        ],
      ];
    }

    return [invite, null];
  }

  private validateInviteTarget(
    invite: MatchmakingInvite,
    targetPlayerId: string,
  ) {
    if (invite.ownerPlayerId === targetPlayerId) {
      return [
        new ServiceError({
          reason: SEReason.NOT_ALLOWED,
          field: 'playerId',
          value: targetPlayerId,
          message: 'Room owner cannot invite themselves.',
        }),
      ];
    }

    if (invite.players.includes(targetPlayerId)) {
      return [
        new ServiceError({
          reason: SEReason.NOT_ALLOWED,
          field: 'playerId',
          value: targetPlayerId,
          message: 'Player is already in the matchmaking room.',
        }),
      ];
    }

    return null;
  }

  /**
   * Checks whether a player can join an existing invite in its current state.
   */
  private validateJoinInvite(
    invite: MatchmakingInvite,
    playerId: string,
    body: JoinMatchmakingInviteDto,
  ) {
    if (
      invite.status === InviteStatus.CANCELLED ||
      invite.status === InviteStatus.MATCHED ||
      invite.status === InviteStatus.QUEUED
    ) {
      return [
        new ServiceError({
          reason: SEReason.NOT_ALLOWED,
          field: 'status',
          value: invite.status,
          message: 'Invite can no longer be joined.',
        }),
      ];
    }

    if (invite.matchType === MatchType.CUSTOM && !body.roomId) {
      return [
        new ServiceError({
          reason: SEReason.REQUIRED,
          field: 'roomId',
          value: body.roomId,
          message: 'CUSTOM invite joins require roomId.',
        }),
      ];
    }

    if (invite.matchType === MatchType.CUSTOM && body.roomId) {
      if (body.roomId !== invite.roomId) {
        return [
          new ServiceError({
            reason: SEReason.VALIDATION,
            field: 'roomId',
            value: body.roomId,
            message: 'Provided roomId does not match the invite roomId.',
          }),
        ];
      }
    }

    if (this.isInviteFull(invite) && invite.bots.length === 0) {
      return [
        new ServiceError({
          reason: SEReason.NOT_ALLOWED,
          field: 'inviteId',
          value: invite.id,
          message: 'Invite is already full.',
        }),
      ];
    }

    if (invite.ownerPlayerId === playerId) return null;

    return null;
  }

  /**
   * Prevents a player from being attached to more than one open matchmaking
   * invite at a time.
   */
  private async validatePlayerHasNoActiveInvite(playerId: string) {
    const activeInviteId = await this.redisService.get(
      this.playerInviteKey(playerId),
    );
    if (!activeInviteId) return null;

    const [activeInvite] = await this.readInvite(activeInviteId);
    if (!activeInvite) {
      await this.redisService.delete(this.playerInviteKey(playerId));
      return null;
    }

    if (
      activeInvite.status === InviteStatus.CANCELLED ||
      activeInvite.status === InviteStatus.MATCHED
    ) {
      await this.redisService.delete(this.playerInviteKey(playerId));
      return null;
    }

    return [
      new ServiceError({
        reason: SEReason.NOT_UNIQUE,
        field: 'playerId',
        value: playerId,
        message: 'Player already has an active matchmaking invite.',
      }),
    ];
  }

  /**
   * Recomputes bot fillers and OPEN/READY status after create or join changes.
   */
  private recalculateInvite(invite: MatchmakingInvite): MatchmakingInvite {
    const capacity = this.getInviteCapacity(invite);
    const playerSlots = Math.max(capacity - invite.players.length, 0);
    const bots = !invite.allowBots
      ? invite.bots.slice(0, playerSlots)
      : this.createBots(invite.id, playerSlots);
    const participantCount = invite.players.length + bots.length;
    const status =
      participantCount >= capacity ? InviteStatus.READY : InviteStatus.OPEN;

    return {
      ...invite,
      bots,
      status,
      readyAt:
        status === InviteStatus.READY
          ? (invite.readyAt ?? invite.updatedAt)
          : undefined,
    };
  }

  private makeRoomForPlayer(invite: MatchmakingInvite): MatchmakingInvite {
    if (!this.isInviteFull(invite) || invite.bots.length === 0) return invite;

    return {
      ...invite,
      bots: invite.bots.slice(0, -1),
    };
  }

  private isInviteFull(invite: MatchmakingInvite) {
    return (
      invite.players.length + invite.bots.length >=
      this.getInviteCapacity(invite)
    );
  }

  private getInviteCapacity(invite: MatchmakingInvite) {
    return invite.matchType === MatchType.CUSTOM
      ? invite.teamSize * 2
      : invite.teamSize;
  }

  private createBots(inviteId: string, amount: number) {
    return Array.from(
      { length: amount },
      (_, index): MatchmakingBotParticipant => {
        const botNumber = index + 1;

        return {
          botId: `${inviteId}:bot:${botNumber}`,
          displayName: `Bot ${botNumber}`,
          isBot: true,
        };
      },
    );
  }

  private resolveTeamSize(body: CreateMatchmakingInviteDto): 1 | 2 {
    if (body.matchType === MatchType.CUSTOM) return body.teamSize ?? 2;

    return 2;
  }

  private resolveAllowBots(body: CreateMatchmakingInviteDto) {
    if (body.matchType === MatchType.CUSTOM) return body.allowBots ?? false;

    return body.allowBots ?? true;
  }

  /**
   * Scans Redis invite keys for the lightweight list endpoint.
   */
  private async getAllInvites() {
    const values = await this.redisService.getValuesByKeyPattern(
      `${this.INVITE_KEY_PREFIX}:*`,
    );

    return Object.values(values)
      .filter((value): value is string => Boolean(value))
      .map((value) => JSON.parse(value) as MatchmakingInvite);
  }

  /**
   * Reads one invite from Redis and returns the standard service error shape if
   * it has expired or never existed.
   */
  private async readInvite(
    inviteId: string,
  ): Promise<IServiceReturn<MatchmakingInvite>> {
    const inviteRaw = await this.redisService.get(this.inviteKey(inviteId));
    if (!inviteRaw) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'inviteId',
            value: inviteId,
            message: 'Matchmaking invite not found.',
          }),
        ],
      ];
    }

    return [JSON.parse(inviteRaw) as MatchmakingInvite, null];
  }

  /**
   * Stores an invite using either the normal invite TTL or a caller-provided TTL.
   */
  private async saveInvite(
    invite: MatchmakingInvite,
    ttlS = this.INVITE_TTL_S,
  ) {
    await this.redisService.set(
      this.inviteKey(invite.id),
      JSON.stringify(invite),
      ttlS,
    );
  }

  private async setPlayerInvite(playerId: string, inviteId: string) {
    await this.redisService.set(
      this.playerInviteKey(playerId),
      inviteId,
      this.INVITE_TTL_S,
    );
  }

  /**
   * Broadcasts invite state to every real player currently attached to it.
   */
  private async notifyInvitePlayers(invite: MatchmakingInvite) {
    const inviteDto = this.toInviteDto(invite);
    await Promise.all(
      invite.players.map((playerId) =>
        this.notifier.inviteUpdated(playerId, inviteDto),
      ),
    );
  }

  private inviteKey(inviteId: string) {
    return `${this.INVITE_KEY_PREFIX}:${inviteId}`;
  }

  private playerInviteKey(playerId: string) {
    return `${this.PLAYER_INVITE_KEY_PREFIX}:${playerId}`;
  }

  private queueKey(matchType: MatchType) {
    return `${this.QUEUE_KEY_PREFIX}:${matchType}`;
  }

  private matchKey(matchId: string) {
    return `${this.MATCH_KEY_PREFIX}:${matchId}`;
  }

  private playerMatchKey(playerId: string) {
    return `${this.PLAYER_MATCH_KEY_PREFIX}:${playerId}`;
  }

  private matchLeaderboardLockKey(matchId: string) {
    return `${this.MATCH_LEADERBOARD_LOCK_KEY_PREFIX}:${matchId}`;
  }

  private isBotParticipant(
    participant: MatchmakingParticipant,
  ): participant is MatchmakingBotParticipant {
    return participant.isBot === true;
  }

  private isPlayerParticipant(
    participant: MatchmakingParticipant,
  ): participant is MatchmakingPlayerParticipant {
    return participant.isBot === false;
  }

  /**
   * Maps internal Redis invite state to the public API shape.
   */
  private toInviteDto(invite: MatchmakingInvite): MatchmakingInviteDto {
    return {
      id: invite.id,
      matchType: invite.matchType,
      status: invite.status,
      ownerPlayerId: invite.ownerPlayerId,
      clanId: invite.clanId,
      roomId: invite.roomId,
      players: invite.players,
      bots: invite.bots,
      teamSize: invite.teamSize,
      allowBots: invite.allowBots,
      createdAt: invite.createdAt,
      updatedAt: invite.updatedAt,
      readyAt: invite.readyAt,
      matchId: invite.matchId,
    };
  }

  /**
   * Maps room state to the compact payload used when inviting players into that
   * room.
   */
  private toRoomInviteDto(
    invite: MatchmakingInvite,
    senderPlayerId: string,
  ): MatchmakingRoomInviteDto {
    return {
      id: invite.id,
      matchType: invite.matchType,
      status: invite.status,
      ownerPlayerId: invite.ownerPlayerId,
      senderPlayerId,
      teamSize: invite.teamSize,
      allowBots: invite.allowBots,
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Maps internal active match state to the public API and MQTT shape.
   */
  private toMatchDto(match: ActiveMatch): MatchmakingMatchDto {
    return {
      id: match.id,
      matchType: match.matchType,
      status: match.status,
      teamSize: match.teamSize,
      teams: match.teams.map((team) => this.toTeamDto(team)),
      startedAt: match.startedAt,
      readyPlayerIds: match.readyPlayerIds,
      battleStartedAt: match.battleStartedAt,
      finishedAt: match.finishedAt,
      result: match.result,
    };
  }

  private toTeamDto(team: MatchmakingTeam): MatchmakingTeamDto {
    const players: MatchmakingPlayerParticipantDto[] = [];
    const bots: MatchmakingMatchBotParticipantDto[] = [];

    for (const participant of team.participants) {
      if (this.isBotParticipant(participant)) bots.push(participant);
      else if (this.isPlayerParticipant(participant)) players.push(participant);
    }

    return {
      side: team.side,
      clanId: team.clanId,
      players,
      bots,
    };
  }
}
