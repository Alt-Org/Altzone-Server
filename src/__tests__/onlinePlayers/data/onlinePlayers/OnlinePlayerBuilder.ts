import OnlinePlayer from '../../../../onlinePlayers/payload/OnlinePlayer';
import { OnlinePlayerStatus } from '../../../../onlinePlayers/enum/OnlinePlayerStatus';

export class OnlinePlayerBuilder<Additional = any> {
  private readonly base: Partial<OnlinePlayer<Additional>> = {
    _id: undefined,
    name: 'player1',
    status: OnlinePlayerStatus.UI,
    additional: undefined,
  };

  build(): OnlinePlayer<Additional> {
    return { ...this.base } as OnlinePlayer<Additional>;
  }

  setId(id: string): this {
    this.base._id = id;
    return this;
  }

  setName(name: string): this {
    this.base.name = name;
    return this;
  }

  setStatus(status: OnlinePlayerStatus): this {
    this.base.status = status;
    return this;
  }

  setAdditional(additional: Additional): this {
    this.base.additional = additional;
    return this;
  }
}
