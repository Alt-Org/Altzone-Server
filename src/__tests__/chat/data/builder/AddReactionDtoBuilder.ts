import { ObjectId } from 'mongodb';
import { AddReactionDto } from '../../../../chat/dto/addReaction.dto';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';

export default class AddReactionDtoBuilder
  implements IDataBuilder<AddReactionDto>
{
  private readonly base: AddReactionDto = {
    message_id: new ObjectId().toString(),
    emoji: '👍',
  };

  build(): AddReactionDto {
    return { ...this.base };
  }

  setMessageId(id: string) {
    this.base.message_id = id;
    return this;
  }

  setEmoji(emoji: string) {
    this.base.emoji = emoji;
    return this;
  }
}
