import { isChatExists } from "../../../chat/decorator/validation/IsChatExists.decorator";
import CreateChatDtoBuilder from "../data/chat/createChatDtoBuilder";
import ChatModule from "../modules/chat.module";
import { TestingModule } from "@nestjs/testing";
import { mongo } from "mongoose";
import ChatCommonModule from "../modules/chatCommon.module";

describe("IsChatExists Decorator", () => {
	const chatBuilder = new CreateChatDtoBuilder();
	const testChatName = "testChat";
	const chatToCreate = chatBuilder.setName(testChatName).build();
	let module: TestingModule;
	let chatId: string;

	beforeEach(async () => {
		module = await ChatCommonModule.getModule();
		const model = await ChatModule.getChatModel();
		const chat = await model.create(chatToCreate);
		chatId = chat.id;
	});

	it("should not validate if chat does not exist", async () => {
		const isChatExistsInstance = module.get<isChatExists>(isChatExists);
		const isValid = await isChatExistsInstance.validate(chatId);
		expect(isValid).toBe(true);

		const nonExistentId = new mongo.ObjectId().toString();
		const isInvalid = await isChatExistsInstance.validate(nonExistentId);
		expect(isInvalid).toBe(false);
	});
});
