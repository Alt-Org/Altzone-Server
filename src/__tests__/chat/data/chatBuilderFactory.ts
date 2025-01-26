import CreateChatDtoBuilder from "./chat/createChatDtoBuilder";
import CreateMessageDtoBuilder from "./chat/createMessageDtoBuilder";

type BuilderName = "CreateChatDto" | "CreateMessageDto";

type BuilderMap = {
	CreateChatDto: CreateChatDtoBuilder;
	CreateMessageDto: CreateMessageDtoBuilder;
};

export default class ChatBuilderFactory {
	static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
		switch (builderName) {
			case "CreateChatDto":
				return new CreateChatDtoBuilder() as BuilderMap[T];
			case "CreateMessageDto":
				return new CreateMessageDtoBuilder() as BuilderMap[T];
			default:
				throw new Error(`Unknown builder name: ${builderName}`);
		}
	}
}
