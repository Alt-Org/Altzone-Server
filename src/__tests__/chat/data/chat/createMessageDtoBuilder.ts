import { CreateMessageDto } from '../../../../chat/dto/createMessage.dto';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';

export default class CreateMessageDtoBuilder
  implements IDataBuilder<CreateMessageDto>
{
  private readonly base: CreateMessageDto = {
    id: 12,
    senderUsername: 'testSender',
    content: 'test content',
    feeling: 420,
  };

  setId(id: number): CreateMessageDtoBuilder {
    this.base.id = id;
    return this;
  }

  setSenderUsername(senderUsername: string): CreateMessageDtoBuilder {
    this.base.senderUsername = senderUsername;
    return this;
  }

  setContent(content: string): CreateMessageDtoBuilder {
    this.base.content = content;
    return this;
  }

  setFeeling(feeling: number): CreateMessageDtoBuilder {
    this.base.feeling = feeling;
    return this;
  }

  build(): CreateMessageDto {
    return { ...this.base };
  }
}
