import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ClanService } from '../clan/clan.service';
import { RedisService } from '../common/service/redis/redis.service';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { IServiceReturn } from '../common/service/basicService/IService';
import { PlayerService } from '../player/player.service';
import { CreateMatchmakingInviteDto } from './dto/createMatchmakingInvite.dto';
import { JoinMatchmakingInviteDto } from './dto/joinMatchmakingInvite.dto';
import { MatchmakingInviteDto } from './dto/matchmakingInvite.dto';
import { InviteStatus } from './enum/inviteStatus.enum';
import { MatchType } from './enum/matchType.enum';
import { MatchmakingNotifier } from './matchmaking.notifier';
import { MatchmakingInvite } from './type/matchmakingInvite.type';
import { MatchmakingBotParticipant } from './type/matchmakingParticipant.type';

@Injectable()
export class MatchmakingService {
  private readonly INVITE_TTL_S = 5 * 60;
  private readonly CANCELLED_INVITE_TTL_S = 60;
  private readonly INVITE_KEY_PREFIX = 'matchmaking:invite';
  private readonly PLAYER_INVITE_KEY_PREFIX = 'matchmaking:player-invite';

  constructor(
    private readonly redisService: RedisService,
    private readonly playerService: PlayerService,
    private readonly clanService: ClanService,
    private readonly notifier: MatchmakingNotifier,
  ) {}

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

  async getInvite(
    inviteId: string,
  ): Promise<IServiceReturn<MatchmakingInviteDto>> {
    const [invite, inviteErrors] = await this.readInvite(inviteId);
    if (inviteErrors) return [null, inviteErrors];

    return [this.toInviteDto(invite), null];
  }

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

  async cancelInvite(
    inviteId: string,
    playerId: string,
  ): Promise<IServiceReturn<void>> {
    const [invite, inviteErrors] = await this.readInvite(inviteId);
    if (inviteErrors) return [null, inviteErrors];

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

    await this.saveInvite(cancelledInvite, this.CANCELLED_INVITE_TTL_S);
    await Promise.all(
      invite.players.map((invitePlayerId) =>
        this.redisService.delete(this.playerInviteKey(invitePlayerId)),
      ),
    );
    await this.notifyInvitePlayers(cancelledInvite);

    return [null, null];
  }

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

  private recalculateInvite(invite: MatchmakingInvite): MatchmakingInvite {
    const capacity = this.getInviteCapacity(invite);
    const playerSlots = Math.max(capacity - invite.players.length, 0);
    const bots =
      invite.matchType === MatchType.CUSTOM || !invite.allowBots
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

  private async getAllInvites() {
    const values = await this.redisService.getValuesByKeyPattern(
      `${this.INVITE_KEY_PREFIX}:*`,
    );

    return Object.values(values)
      .filter((value): value is string => Boolean(value))
      .map((value) => JSON.parse(value) as MatchmakingInvite);
  }

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
}
