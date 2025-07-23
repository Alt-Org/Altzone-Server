import { ChatType } from '../../../../chat/enum/chatMessageType.enum';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { Feeling } from '../../../../chat/enum/feeling.enum';
import { ObjectId } from 'mongodb';
import { UpdateChatMessageDto } from '../../../../chat/dto/updateChatMessage.dto';

export default class UpdateChatMessageDtoBuilder implements IDataBuilder<UpdateChatMessageDto> {
  private readonly base: UpdateChatMessageDto = {
    _id: new ObjectId().toString(),
    type: ChatType.GLOBAL,
    sender_id: new ObjectId().toString(),
    content: 'Default message content',
    feeling: Feeling.NONE,
    recipient_id: undefined,
    clan_id: undefined,
  };

  build(): UpdateChatMessageDto {
    return { ...this.base } as UpdateChatMessageDto;
  }

  setId(Id: string): this {
    this.base._id = Id;
    return this;
  }

  setType(type: ChatType): this {
    this.base.type = type;
    return this;
  }

  setSenderId(senderId: string | ObjectId): this {
    this.base.sender_id = senderId;
    return this;
  }

  setContent(content: string): this {
    this.base.content = content;
    return this;
  }

  setFeeling(feeling: Feeling): this {
    this.base.feeling = feeling;
    return this;
  }

  setRecipientId(recipientId: string | undefined): this {
    this.base.recipient_id = recipientId;
    return this;
  }

  setClanId(clanId: string | undefined): this {
    this.base.clan_id = clanId;
    return this;
  }
}
