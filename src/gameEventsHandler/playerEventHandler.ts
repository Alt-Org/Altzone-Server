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
import { ClientSession, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class PlayerEventHandler {
  constructor(
    private readonly playerRewarder: PlayerRewarder,
    private readonly playerStatistics: PlayerStatisticService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Handles player events by updating statistics and rewarding the player.
   *
   * @param player_id - The unique identifier of the player.
   * @param event - The player event to handle.
   * @param openedSession - An optional MongoDB client session for transaction management.
   *
   * @returns A promise that resolves to a tuple containing a boolean indicating success and an array of ServiceErrors if any occurred.
   */
  async handlePlayerEvent(
    player_id: string,
    event: PlayerEvent,
    openedSession?: ClientSession,
  ): Promise<[boolean, ServiceError[]]> {
    const session = await InitializeSession(this.connection, openedSession);

    const [_, playerStatError] =
      await this.playerStatistics.updatePlayerStatistic(player_id, event);
    if (playerStatError)
      return await cancelTransaction(
        session,
        playerStatError as ServiceError[],
        openedSession,
      );

    const [__, playerEventError] =
      await this.playerRewarder.rewardForPlayerEvent(player_id, event);
    if (playerEventError)
      return await cancelTransaction(session, playerEventError, openedSession);

    return await endTransaction(session, openedSession);
  }
}
