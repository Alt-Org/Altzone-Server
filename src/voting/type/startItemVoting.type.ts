import SetClanRoleDto from '../../clan/role/dto/setClanRole.dto';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import { FleaMarketItemDto } from '../../fleaMarket/dto/fleaMarketItem.dto';
import { PlayerDto } from '../../player/dto/player.dto';
import { VotingQueueName } from '../enum/VotingQueue.enum';
import { VotingType } from '../enum/VotingType.enum';

export type StartVotingParams = {
  voterPlayer: PlayerDto;
  type: VotingType;
  queue: VotingQueueName;
  clanId: string;
  fleaMarketItem?: FleaMarketItemDto;
  shopItem?: ItemName;
  setClanRole?: SetClanRoleDto;
  endsOn?: Date;
};
