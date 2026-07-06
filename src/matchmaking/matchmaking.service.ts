import { Injectable, NotImplementedException } from '@nestjs/common';
import { ClanService } from '../clan/clan.service';
import { RedisService } from '../common/service/redis/redis.service';
import { PlayerService } from '../player/player.service';
import { CreateMatchmakingInviteDto } from './dto/createMatchmakingInvite.dto';
import { JoinMatchmakingInviteDto } from './dto/joinMatchmakingInvite.dto';
import { MatchmakingInviteDto } from './dto/matchmakingInvite.dto';
import { MatchmakingNotifier } from './matchmaking.notifier';

@Injectable()
export class MatchmakingService {
  constructor(
    private readonly redisService: RedisService,
    private readonly playerService: PlayerService,
    private readonly clanService: ClanService,
    private readonly notifier: MatchmakingNotifier,
  ) {}

  async createInvite(
    playerId: string,
    body: CreateMatchmakingInviteDto,
  ): Promise<MatchmakingInviteDto> {
    void playerId;
    void body;
    void this.redisService;
    void this.playerService;
    void this.clanService;
    void this.notifier;

    throw new NotImplementedException(
      'Matchmaking invite creation will be implemented in phase 4.',
    );
  }

  async getInvites(playerId: string): Promise<MatchmakingInviteDto[]> {
    void playerId;

    throw new NotImplementedException(
      'Matchmaking invite listing will be implemented in phase 4.',
    );
  }

  async getInvite(inviteId: string): Promise<MatchmakingInviteDto> {
    void inviteId;

    throw new NotImplementedException(
      'Matchmaking invite lookup will be implemented in phase 4.',
    );
  }

  async joinInvite(
    inviteId: string,
    playerId: string,
    body: JoinMatchmakingInviteDto,
  ): Promise<MatchmakingInviteDto> {
    void inviteId;
    void playerId;
    void body;

    throw new NotImplementedException(
      'Matchmaking invite joining will be implemented in phase 4.',
    );
  }

  async cancelInvite(inviteId: string, playerId: string): Promise<void> {
    void inviteId;
    void playerId;

    throw new NotImplementedException(
      'Matchmaking invite cancellation will be implemented in phase 4.',
    );
  }
}