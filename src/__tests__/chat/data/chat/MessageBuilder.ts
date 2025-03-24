import { Message } from '../../../../chat/chat.schema';

export default class MessageBuilder {
  private readonly base: Partial<Message> = {
    id: 1,
    senderUsername: 'defaultUser',
    content: 'defaultMessage',
    feeling: 0,
  };

  build(): Message {
    return { ...this.base } as Message;
  }

  setId(id: number) {
    this.base.id = id;
    return this;
  }

  setSenderUsername(username: string) {
    this.base.senderUsername = username;
    return this;
  }

  setContent(content: string) {
    this.base.content = content;
    return this;
  }

  setFeeling(feeling: number) {
    this.base.feeling = feeling;
    return this;
  }
}
