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
	const chatToCreate = chatBuilder.build();

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
		const messageContent1 = "Hello, world!";
		const messageToCreate1 = messageBuilder
			.setId(22)
			.setSenderUsername("testUser1")
			.setContent(messageContent1)
			.build();

		const messageContent2 = "Goodbye, world!";
		const messageToCreate2 = messageBuilder
			.setId(23)
			.setSenderUsername("testUser2")
			.setContent(messageContent2)
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
		expect(messages.data.Chat[0]).toEqual(
			expect.objectContaining(messageToCreate1)
		);
	});

	it("Should return all messages in the chat", async () => {
		const messageToCreate1 = messageBuilder
			.setSenderUsername("testUser1")
			.build();

		const messageContent2 = "Goodbye, world!";
		const messageToCreate2 = messageBuilder
			.setSenderUsername("testUser2")
			.setContent(messageContent2)
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
		expect(messages.data.Chat[0]).toEqual(
			expect.objectContaining(messageToCreate1)
		);
		expect(messages.data.Chat[1]).toEqual(
			expect.objectContaining(messageToCreate2)
		);
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
