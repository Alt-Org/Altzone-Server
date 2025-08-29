import { Injectable } from '@nestjs/common';
import { GameEventType } from './enum/GameEventType.enum';
import ServiceError from '../common/service/basicService/ServiceError';
import { PlayerEventHandler } from './playerEventHandler';
import { ClanEventHandler } from './clanEventHandler';
import { PlayerEvent } from '../rewarder/playerRewarder/enum/PlayerEvent.enum';

@Injectable()
export class GameEventsHandler {
  constructor(
    private readonly playerEventHandler: PlayerEventHandler,
    private readonly clanEventHandler: ClanEventHandler,
  ) {}

  async handleEvent(player_id: string, event: GameEventType) {
    switch (event) {
      case GameEventType.PLAYER_WIN_BATTLE:
        return this.handleWinBattle(player_id);
      // case GameEventType.PLAYER_PLAY_BATTLE:
      //   return this.handlePlayBattle(player_id);
      // case GameEventType.PLAYER_SEND_MESSAGE:
      //   return this.handleSendMessage(player_id);
      // case GameEventType.PLAYER_VOTE:
      //   return this.handleVote(player_id);
      case GameEventType.PLAYER_START_VOTING:
        return this.handleStartVoting(player_id);
      case GameEventType.PLAYER_COLLECT_DIAMONDS:
        return this.handleCollectDiamonds(player_id);
      case GameEventType.PLAYER_START_BATTLE_NEW_CHARACTER:
        return this.handleNewCharacter(player_id);

      default:
        return [
          null,
          [new ServiceError({ message: 'The game event is not supported' })],
        ];
    }
  }

  private async handleWinBattle(player_id: string) {
    const [, playerErrors] = await this.playerEventHandler.handlePlayerEvent(
      player_id,
      PlayerEvent.BATTLE_WON,
    );
    const [, clanErrors] =
      await this.clanEventHandler.handlePlayerTask(player_id);

    if (playerErrors || clanErrors)
      return [null, this.concatArrays(playerErrors, clanErrors)];

    return [true, null];
  }

  private async handleStartVoting(player_id: string) {
    const [, clanErrors] =
      await this.clanEventHandler.handlePlayerTask(player_id);

    if (clanErrors) return [null, clanErrors];

    return [true, null];
  }

  private async handleCollectDiamonds(player_id: string) {
    const [, clanErrors] =
      await this.clanEventHandler.handlePlayerTask(player_id);

    if (clanErrors) return [null, clanErrors];

    return [true, null];
  }

  private async handleNewCharacter(player_id: string) {
    const [, clanErrors] =
      await this.clanEventHandler.handlePlayerTask(player_id);

    if (clanErrors) return [null, clanErrors];

    return [true, null];
  }

  private concatArrays(arr1?: any[], arr2?: any[]) {
    const arr1Copy = arr1 ? arr1 : [];
    const arr2Copy = arr2 ? arr2 : [];
    return [...arr1Copy, ...arr2Copy];
  }
}
