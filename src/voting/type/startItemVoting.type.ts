import { FleaMarketItemDto } from '../../fleaMarket/dto/fleaMarketItem.dto';
import { PlayerDto } from '../../player/dto/player.dto';
import { VotingType } from '../enum/VotingType.enum';

export type StartItemVotingParams = {
  player: PlayerDto;
  item: Partial<FleaMarketItemDto>;
  clanId: string;
  type: VotingType;
};
