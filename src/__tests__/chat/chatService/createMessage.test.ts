import { ChatService } from "../../../chat/chat.service";
import ChatModule from "../modules/chat.module";
import ChatBuilderFactory from "../data/chatBuilderFactory";

describe("ChatService.createMessage() test suite", () => {
	let chatService: ChatService;
	let chatId: string;
	const messageBuilder = ChatBuilderFactory.getBuilder("CreateMessageDto");
	const chatModel = ChatModule.getChatModel();
	const chatBuilder = ChatBuilderFactory.getBuilder("CreateChatDto");
	const testChatName = "testChat";

	/**
	 * Before each test, create a chat to be used for message tests.
	 * This ensures that there is a chat available in the database
	 * for the messages to be created in.
	 */
	beforeEach(async () => {
		chatService = await ChatModule.getChatService();
		const chatToCreate = chatBuilder.setName(testChatName).build();
		const chat = await chatModel.create(chatToCreate);
		chatId = chat.id;
	});

	it("Should create a message in the chat if input is valid", async () => {
		const messageToCreate = messageBuilder.build();
		const created = await chatService.createMessage(chatId, messageToCreate);

		const chat = await chatModel.findById(chatId).exec();
		expect(chat.messages).toHaveLength(1);
		expect(chat.messages[0]).toEqual(expect.objectContaining(messageToCreate));
		expect(created).toEqual(true);
	});

	it("Should not create a message if content is missing", async () => {
		const messageToCreate = messageBuilder.build();
		messageToCreate.content = "";

		await expect(
			chatService.createMessage(chatId, messageToCreate)
		).rejects.toThrow();

		const chat = await chatModel.findById(chatId).exec();
		expect(chat.messages).toHaveLength(0);
	});

	it("Should not create a message if senderUsername is missing", async () => {
		const messageToCreate = messageBuilder.build();
        messageToCreate.senderUsername = undefined;

		await expect(
			chatService.createMessage(chatId, messageToCreate)
		).rejects.toThrow();

		const chat = await chatModel.findById(chatId).exec();
		expect(chat.messages).toHaveLength(0);
	});

	it("Should not create a message if feeling is missing", async () => {
		const messageToCreate = messageBuilder.build();
		messageToCreate.feeling = undefined;

		await expect(
			chatService.createMessage(chatId, messageToCreate)
		).rejects.toThrow();

		const chat = await chatModel.findById(chatId).exec();
		expect(chat.messages).toHaveLength(0);
	});
});
