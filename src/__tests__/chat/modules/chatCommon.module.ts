import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { mongooseOptions, mongoString } from "../../test_utils/const/db";
import { ModelName } from "../../../common/enum/modelName.enum";
import { ChatSchema } from "../../../chat/chat.schema";
import { RequestHelperModule } from "../../../requestHelper/requestHelper.module";
import { ChatService } from "../../../chat/chat.service";
import { isChatExists } from "../../../chat/decorator/validation/IsChatExists.decorator";
import { GameEventsHandlerModule } from "../../../gameEventsHandler/gameEventsHandler.module";

export default class ChatCommonModule {
	private constructor() {}

	private static module: TestingModule;

	static async getModule() {
		if (!ChatCommonModule.module)
			ChatCommonModule.module = await Test.createTestingModule({
				imports: [
					MongooseModule.forRoot(mongoString, mongooseOptions),
					MongooseModule.forFeature([
						{ name: ModelName.CHAT, schema: ChatSchema },
					]),

					RequestHelperModule,
					GameEventsHandlerModule
				],
				providers: [ChatService, isChatExists],
			}).compile();

		return ChatCommonModule.module;
	}
}
