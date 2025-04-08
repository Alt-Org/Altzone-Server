import IDataBuilder from '../../../test_utils/interface/IDataBuilder.js';
import { StartItemVotingParams } from '../../../../voting/type/startItemVoting.type.js';
import { PlayerDto } from '../../../../player/dto/player.dto.js';
import { FleaMarketItemDto } from '../../../../fleaMarket/dto/fleaMarketItem.dto.js';
import { VotingType } from '../../../../voting/enum/VotingType.enum';

export default class CreateStartItemVotingParamsDtoBuilder
  implements IDataBuilder<StartItemVotingParams>
{
  private readonly base: Partial<StartItemVotingParams> = {
    player: undefined,
    item: undefined,
    clanId: undefined,
    type: undefined,
  };

  build(): StartItemVotingParams {
    if (!this.base.player) {
      throw new Error("Player is required but not set.");
    }
    return { ...this.base } as StartItemVotingParams;
  }

  setPlayer(player: PlayerDto) {
    this.base.player = player;
    return this;
  }

  setItem(item: FleaMarketItemDto) {
    this.base.item = item;
    return this;
  }

  setType(type: VotingType) {
    this.base.type = type;
    return this;
  }
}
