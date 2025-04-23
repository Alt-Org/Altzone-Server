import { Expose, Type } from 'class-transformer';
import { VotingType } from '../enum/VotingType.enum';
import { Vote } from '../schemas/vote.schema';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import AddType from '../../common/base/decorator/AddType.decorator';
import { Organizer } from './organizer.dto';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import { VoteDto } from './vote.dto';

@AddType('VotingDto')
export class VotingDto {
  @ExtractField()
  @Expose()
  _id: string;

  @Expose()
  organizer: Organizer;

  @Expose()
  endedAt: Date;

  @Expose()
  startedAt: Date;

  @Expose()
  endsOn: Date;

  @Expose()
  type: VotingType;

  @Expose()
  player_ids: string[];

  @Expose()
  minPercentage: number;

  @Expose()
  @Type(() => VoteDto)
  votes: VoteDto[];

  @Expose()
  entity_id: string;

  @Expose()
  entity_name: ItemName;
}
