import { ChatType } from '../../../../chat/enum/chatMessageType.enum';
import { ChatMessage } from '../../../../chat/schema/chatMessage.schema';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { Feeling } from '../../../../chat/enum/feeling.enum';
import { ObjectId } from 'mongodb';

export default class ChatMessageBuilder implements IDataBuilder<ChatMessage> {
  private readonly base: ChatMessage = {
    type: ChatType.GLOBAL,
    sender_id: undefined,
    content: 'Hello there!',
    reactions: [],
  };

  build(): ChatMessage {
    return { ...this.base } as ChatMessage;
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

  setReactions(reactions: any[]): this {
    this.base.reactions = reactions;
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
