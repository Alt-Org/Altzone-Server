import { Injectable } from '@nestjs/common';
import { PlayerRewarder } from '../rewarder/playerRewarder/playerRewarder.service';
import { PlayerStatisticService } from '../statisticsKeeper/playerStatisticKeeper/playerStatisticKeeper.service';
import { PlayerEvent } from '../rewarder/playerRewarder/enum/PlayerEvent.enum';
import ServiceError from '../common/service/basicService/ServiceError';
import { ClientSession } from 'mongoose';

@Injectable()
export class PlayerEventHandler {
  constructor(
    private readonly playerRewarder: PlayerRewarder,
    private readonly playerStatistics: PlayerStatisticService,
  ) {}

  async handlePlayerEvent(
    player_id: string,
    event: PlayerEvent,
    session?: ClientSession,
  ): Promise<[boolean, ServiceError[]]> {
    await this.playerStatistics.updatePlayerStatistic(
      player_id,
      event,
      session,
    );
    const [, rewardErrors] = await this.playerRewarder.rewardForPlayerEvent(
      player_id,
      event,
      session,
    );
    if (rewardErrors) return [null, rewardErrors];

    return [true, null];
  }
}
