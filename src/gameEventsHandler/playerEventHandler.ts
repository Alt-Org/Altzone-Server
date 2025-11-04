import { Injectable } from '@nestjs/common';
import { PlayerRewarder } from '../rewarder/playerRewarder/playerRewarder.service';
import { PlayerStatisticService } from '../statisticsKeeper/playerStatisticKeeper/playerStatisticKeeper.service';
import { PlayerEvent } from '../rewarder/playerRewarder/enum/PlayerEvent.enum';
import ServiceError from '../common/service/basicService/ServiceError';
import {
  cancelTransaction,
  endTransaction,
  InitializeSession,
} from '../common/function/Transactions';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class PlayerEventHandler {
  constructor(
    private readonly playerRewarder: PlayerRewarder,
    private readonly playerStatistics: PlayerStatisticService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async handlePlayerEvent(
    player_id: string,
    event: PlayerEvent,
  ): Promise<[boolean, ServiceError[]]> {
    const session = await InitializeSession(this.connection);

    const [_, playerStatError] = await this.playerStatistics.updatePlayerStatistic(player_id, event);
    if (playerStatError) return await cancelTransaction(session, playerStatError as ServiceError[]);

    const [__, playerEventError] =await this.playerRewarder.rewardForPlayerEvent(player_id, event);
    if (playerEventError) return await cancelTransaction(session, playerEventError);
    
    return await endTransaction(session);
  }
}
