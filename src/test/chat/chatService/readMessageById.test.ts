import { mongo } from "mongoose";
import { ChatService } from "../../../chat/chat.service";
import ChatModule from "../modules/chat.module";
import CreateChatDtoBuilder from "../data/chat/createChatDtoBuilder";
import CreateMessageDtoBuilder from "../data/chat/createMessageDtoBuilder";

describe("ChatService.readOneMessageById() test suite", () => {
    let chatService: ChatService;
    let chatId: string;
    const messageBuilder = new CreateMessageDtoBuilder();
    const chatModel = ChatModule.getChatModel();

    /**
     * Before all tests, create a chat to be used for message tests.
     * This ensures that there is a chat available in the database
     * for the messages to be created in.
     */
    beforeAll(async () => {
        const chatBuilder = new CreateChatDtoBuilder();
        const testChatName = "testChat";
        const chatToCreate = chatBuilder.setName(testChatName).build();
        chatService = await ChatModule.getChatService();
        const chat = await chatService.createOne(chatToCreate);
        chatId = chat['data']['Chat']['_id'];
    });

    beforeEach(async () => {
        chatService = await ChatModule.getChatService();
    });

    afterAll(async () => {
        await chatModel.deleteMany({});
    });

    it("Should return a message by ID if it exists", async () => {
        const messageId = new mongo.ObjectId();
        const messageContent = "Hello, world!";
        const messageToCreate = messageBuilder
            .setId(parseInt(messageId.toString(), 16))
            .setSenderUsername("testUser")
            .setContent(messageContent)
            .setFeeling(5)
            .build();

        await chatService.createMessage(chatId, messageToCreate);

        const message = await chatService.readOneMessageById(chatId, parseInt(messageId.toString(), 16));
        expect(message["data"]["Chat"]["content"]).toBe(messageContent);
    });

    it("Should return null if the message does not exist", async () => {
        const nonExistentMessageId = 999;
        const message = await chatService.readOneMessageById(chatId, nonExistentMessageId);
        expect(message).toBeNull();
    });

    it("Should return null if the chat does not exist", async () => {
        const nonExistentChatId = new mongo.ObjectId().toString();
        const messageId = 1;
        const message = await chatService.readOneMessageById(nonExistentChatId, messageId)
		expect(message).toBeNull();
    });
});