import CreateChatDtoBuilder from "./chat/createChatDtoBuilder";
import CreateMessageDtoBuilder from "./chat/createMessageDtoBuilder";
import ChatBuilder from "./chat/ChatBuilder";
import MessageBuilder from "./chat/MessageBuilder";

type BuilderName =
	"CreateChatDto" | "CreateMessageDto" | "Chat" |
	"Message";

type BuilderMap = {
	CreateChatDto: CreateChatDtoBuilder;
	CreateMessageDto: CreateMessageDtoBuilder;
	Chat: ChatBuilder,
	Message: MessageBuilder
};

export default class ChatBuilderFactory {
	static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
		switch (builderName) {
			case "CreateChatDto":
				return new CreateChatDtoBuilder() as BuilderMap[T];
			case "CreateMessageDto":
				return new CreateMessageDtoBuilder() as BuilderMap[T];
			case "Chat":
				return new ChatBuilder() as BuilderMap[T];
			case "Message":
				return new MessageBuilder() as BuilderMap[T];
			default:
				throw new Error(`Unknown builder name: ${builderName}`);
		}
	}
}
