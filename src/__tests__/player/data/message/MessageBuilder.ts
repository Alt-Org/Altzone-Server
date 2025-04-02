import { Message } from '../../../../player/message.schema';

export default class MessageBuilder {
  private readonly base: Partial<Message> = {
    date: new Date(),
    count: 0,
  };

  build(): Message {
    return { ...this.base } as Message;
  }

  setDate(date: Date) {
    this.base.date = date;
    return this;
  }

  setCount(count: number) {
    this.base.count = count;
    return this;
  }
}
