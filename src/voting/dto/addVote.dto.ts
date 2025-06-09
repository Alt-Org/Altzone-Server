import { IsEnum, IsMongoId } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { VoteChoice } from '../enum/choiceType.enum';

@AddType('AddVoteDto')
export class AddVoteDto {
  /**
   * The ID of the voting event the vote is being added to
   *
   * @example "662f4f1235faaf001ef7b5cb"
   */
  @IsMongoId()
  voting_id: string;

  /**
   * The player's chosen vote option for the item
   *
   * @example "accept"
   */
  @IsEnum(VoteChoice)
  choice: VoteChoice;
}
