import { mongo } from "mongoose";
import { ChatService } from "../../../chat/chat.service";
import ChatModule from "../modules/chat.module";
import ChatBuilderFactory from "../data/chatBuilderFactory";

describe("ChatService.createMessage() test suite", () => {
    let chatService: ChatService;
    let chatId: string;
	const messageBuilder = ChatBuilderFactory.getBuilder('CreateMessageDto');
    const chatModel = ChatModule.getChatModel();

    /**
     * Before all tests, create a chat to be used for message tests.
     * This ensures that there is a chat available in the database
     * for the messages to be created in.
     */
    beforeAll(async () => {
		const chatBuilder = ChatBuilderFactory.getBuilder('CreateChatDto');
        const testChatName = "testChat";
        const chatToCreate = chatBuilder.setName(testChatName).build();
        chatService = await ChatModule.getChatService();
        const chat = await chatService.createOne(chatToCreate);
        chatId = chat['data']['Chat']['_id'];
    });

    beforeEach(async () => {
        chatService = await ChatModule.getChatService();
    });

    it("Should create a message in the chat if input is valid", async () => {
        const messageId = new mongo.ObjectId();
        const messageContent = "Hello, world!";
        const messageToCreate = messageBuilder
            .setId(parseInt(messageId.toString(), 16))
            .setSenderUsername("testUser")
            .setContent(messageContent)
            .setFeeling(5)
            .build();

        const created = await chatService.createMessage(chatId, messageToCreate);

        const chat = await chatModel.findById(chatId).exec();
        expect(chat.messages).toHaveLength(1);
        expect(chat.messages[0].content).toBe(messageContent);
        expect(created).toEqual(true);
    });

    it("Should not create a message if content is missing", async () => {
        const messageId = new mongo.ObjectId();
        const messageToCreate = messageBuilder
            .setId(parseInt(messageId.toString(), 16))
            .setSenderUsername("testUser")
            .setFeeling(5)
            .build();

        await expect(chatService.createMessage(chatId, messageToCreate)).rejects.toThrow();
    });

    it("Should not create a message if senderUsername is missing", async () => {
        const messageId = new mongo.ObjectId();
        const messageContent = "Hello, world!";
        const messageToCreate = messageBuilder
            .setId(parseInt(messageId.toString(), 16))
            .setContent(messageContent)
            .setFeeling(5)
            .build();

        await expect(chatService.createMessage(chatId, messageToCreate)).rejects.toThrow();
    });

    it("Should not create a message if feeling is missing", async () => {
        const messageId = new mongo.ObjectId();
        const messageContent = "Hello, world!";
        const messageToCreate = messageBuilder
            .setId(parseInt(messageId.toString(), 16))
            .setSenderUsername("testUser")
            .setContent(messageContent)
            .build();

        await expect(chatService.createMessage(chatId, messageToCreate)).rejects.toThrow();
    });
});
