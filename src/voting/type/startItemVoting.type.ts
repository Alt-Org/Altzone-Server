import { FleaMarketItemDto } from '../../fleaMarket/dto/fleaMarketItem.dto';
import { PlayerDto } from '../../player/dto/player.dto';
import { VotingType } from '../enum/VotingType.enum';

export type StartItemVotingParams = {
  player: PlayerDto;
  item: FleaMarketItemDto;
  clanId: string;
  type: VotingType.BUYING_ITEM | VotingType.SELLING_ITEM;
};
