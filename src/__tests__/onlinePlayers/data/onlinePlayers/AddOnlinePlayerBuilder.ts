import AddOnlinePlayer from '../../../../onlinePlayers/payload/AddOnlinePlayer';
import { OnlinePlayerStatus } from '../../../../onlinePlayers/enum/OnlinePlayerStatus';

export class AddOnlinePlayerBuilder {
  private readonly base: Partial<AddOnlinePlayer> = {
    player_id: undefined,
    status: OnlinePlayerStatus.UI,
  };

  build(): AddOnlinePlayer {
    return { ...this.base } as AddOnlinePlayer;
  }

  setPlayerId(player_id: string): this {
    this.base.player_id = player_id;
    return this;
  }

  setStatus(status: OnlinePlayerStatus): this {
    this.base.status = status;
    return this;
  }
}
