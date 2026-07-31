import { NotificationStatus } from '../../common/service/notificator/enum/NotificationStatus.enum';
import { PlayerDto } from '../../player/dto/player.dto';
import { Vote } from '../schemas/vote.schema';
import { VotingType } from '../enum/VotingType.enum';

export type VotingPayload<TEntity = unknown> = {
  topic: string;
  status:
    | NotificationStatus.NEW
    | NotificationStatus.UPDATE
    | NotificationStatus.END;
  voting_id: string; // mongo id
  type: VotingType;
  entity: TEntity; // FleaMarketItemDto, shop item, SetClanRoleDto, governance payload, etc.
  voter?: PlayerDto;
  organizer?: PlayerDto;
  votes?: Vote[];
  endedAt?: Date;
};
