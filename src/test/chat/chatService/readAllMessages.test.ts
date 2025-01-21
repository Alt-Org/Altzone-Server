import { mongo } from "mongoose";
import { ChatService } from "../../../chat/chat.service";
import ChatModule from "../modules/chat.module";
import CreateChatDtoBuilder from "../data/chat/createChatDtoBuilder";
import CreateMessageDtoBuilder from "../data/chat/createMessageDtoBuilder";
import { IGetAllQuery } from "../../../common/interface/IGetAllQuery";
import { IResponseShape } from "../../../common/interface/IResponseShape";
import { Chat } from "../../../chat/chat.schema";

describe("ChatService.readAllMessages() test suite", () => {
	let chatService: ChatService;
	let chatId: string;
	const messageBuilder = new CreateMessageDtoBuilder();
	const chatBuilder = new CreateChatDtoBuilder();
	const testChatName = "testChat";
	const chatToCreate = chatBuilder.setName(testChatName).build();

	/**
	 * Before each test, create a chat to be used for message tests.
	 * This ensures that there is a chat available in the database
	 * for the messages to be created in.
	 */
	beforeEach(async () => {
		chatService = await ChatModule.getChatService();
		const chatModel = await ChatModule.getChatModel();
		const chat = await chatModel.create(chatToCreate);
		chatId = chat.id;
	});

	it("Should return paginated messages", async () => {
		const messageId1 = new mongo.ObjectId();
		const messageContent1 = "Hello, world!";
		const messageToCreate1 = messageBuilder
			.setId(parseInt(messageId1.toString(), 16))
			.setSenderUsername("testUser1")
			.setContent(messageContent1)
			.setFeeling(5)
			.build();

		const messageId2 = new mongo.ObjectId();
		const messageContent2 = "Goodbye, world!";
		const messageToCreate2 = messageBuilder
			.setId(parseInt(messageId2.toString(), 16))
			.setSenderUsername("testUser2")
			.setContent(messageContent2)
			.setFeeling(3)
			.build();

		await chatService.createMessage(chatId, messageToCreate1);
		await chatService.createMessage(chatId, messageToCreate2);

		const query: IGetAllQuery = {
			filter: {},
			sort: { id: 1 },
			limit: 1,
			skip: 0,
		};
		const messages = (await chatService.readAllMessages(
			chatId,
			query
		)) as IResponseShape<Chat>;

		expect(messages.data.Chat).toHaveLength(1);
		expect(messages.data.Chat[0].content).toBe("Hello, world!");
	});

	it("Should return all messages in the chat", async () => {
		const messageId1 = new mongo.ObjectId();
		const messageContent1 = "Hello, world!";
		const messageToCreate1 = messageBuilder
			.setId(parseInt(messageId1.toString(), 16))
			.setSenderUsername("testUser1")
			.setContent(messageContent1)
			.setFeeling(5)
			.build();

		const messageId2 = new mongo.ObjectId();
		const messageContent2 = "Goodbye, world!";
		const messageToCreate2 = messageBuilder
			.setId(parseInt(messageId2.toString(), 16))
			.setSenderUsername("testUser2")
			.setContent(messageContent2)
			.setFeeling(3)
			.build();

		await chatService.createMessage(chatId, messageToCreate1);
		await chatService.createMessage(chatId, messageToCreate2);

		const query: IGetAllQuery = {
			filter: {},
			sort: { id: 1 },
			limit: 10,
			skip: 0,
		};
		const messages = (await chatService.readAllMessages(
			chatId,
			query
		)) as IResponseShape<Chat>;

		expect(messages.data.Chat).toHaveLength(2);
		expect(messages.data.Chat[0].content).toBe(messageContent1);
		expect(messages.data.Chat[1].content).toBe(messageContent2);
	});

	it("Should return an empty array if no messages match the filter", async () => {
		const query: IGetAllQuery = {
			filter: { senderUsername: "nonExistentUser" },
			sort: { id: 1 },
			limit: 10,
			skip: 0,
		};
		const messages = (await chatService.readAllMessages(
			chatId,
			query
		)) as IResponseShape<Chat>;

		expect(messages.data.Chat).toHaveLength(0);
	});
});
