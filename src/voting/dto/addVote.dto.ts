import { IsEnum, IsMongoId } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { ItemVoteChoice } from '../enum/choiceType.enum';

@AddType('AddVoteDto')
export class AddVoteDto {
  @IsMongoId()
  voting_id: string;

  @IsEnum(ItemVoteChoice)
  choice: ItemVoteChoice;
}
