import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { Vote } from '../../../../voting/schemas/vote.schema';
import { ItemVoteChoice } from '../../../../voting/enum/choiceType.enum';

export default class VoteBuilder
  implements IDataBuilder<Vote>
{
  private readonly base: Vote = {
    player_id: '',
    choice:  ItemVoteChoice.YES,
  };

  build(): Vote {
    return { ...this.base };
  }

  setChoice(choice: ItemVoteChoice) {
    this.base.choice = choice;
    return this;
  }
}
