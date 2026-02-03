import { VotingDto } from '../../voting/dto/voting.dto';
import { VotingQueueName } from '../../voting/enum/VotingQueue.enum';

export type VotingQueueParams = {
  voting: VotingDto;
  clanId?: string;
  price?: number;
  stockId?: string;
  fleaMarketItemId?: string;
  queue: VotingQueueName;
};
