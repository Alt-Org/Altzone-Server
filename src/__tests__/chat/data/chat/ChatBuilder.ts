import {Chat, Message} from "../../../../chat/chat.schema";
import {ObjectId} from "mongodb";

export default class ChatBuilder {
    private readonly base: Partial<Chat> = {
        name: 'defaultChatName',
        messages: [],
        _id: undefined
    };

    build(): Chat {
        return { ...this.base } as Chat;
    }

    setId(_id: ObjectId) {
        this.base._id = _id;
        return this;
    }

    setName(name: string) {
        this.base.name = name;
        return this;
    }

    setMessages(messages: Message[]) {
        this.base.messages = messages;
        return this;
    }

    addMessage(message: Message) {
        if (!this.base.messages) {
            this.base.messages = [];
        }
        this.base.messages.push(message);
        return this;
    }
}
