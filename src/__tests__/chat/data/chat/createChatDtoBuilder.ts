import { CreateChatDto } from '../../../../chat/dto/createChat.dto';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';

export default class CreateChatDtoBuilder
  implements IDataBuilder<CreateChatDto>
{
  private readonly base: CreateChatDto = {
    name: 'defaultChat',
  };

  build(): CreateChatDto {
    return { ...this.base };
  }

  setName(name: string) {
    this.base.name = name;
    return this;
  }
}
