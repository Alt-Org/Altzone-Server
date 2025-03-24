import { NotificationStatus } from '../../common/service/notificator/enum/NotificationStatus.enum';
import { FleaMarketItemDto } from '../../fleaMarket/dto/fleaMarketItem.dto';
import { PlayerDto } from '../../player/dto/player.dto';
import { VotingType } from '../enum/VotingType.enum';

export type VotingPayload = {
  topic: string;
  status: NotificationStatus;
  voting_id: string; // mongo id
  type: VotingType;
  item: FleaMarketItemDto;
  voter?: PlayerDto;
  organizer?: PlayerDto;
};
