import { VotingDto } from '../../voting/dto/voting.dto';

export type VotingQueueParams = {
  voting: VotingDto;
  clanId?: string;
  price?: number;
  stockId: string;
  fleaMarketItemId?: string;
};
