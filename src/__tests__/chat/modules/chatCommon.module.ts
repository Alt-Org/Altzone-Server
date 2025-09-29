import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ModelName } from '../../../common/enum/modelName.enum';
import { RequestHelperModule } from '../../../requestHelper/requestHelper.module';
import { ChatService } from '../../../chat/service/chat.service';
import { GameEventsHandlerModule } from '../../../gameEventsHandler/gameEventsHandler.module';
import { ChatMessageSchema } from '../../../chat/schema/chatMessage.schema';
import { ClanChatService } from '../../../chat/service/clanChat.service';
import { GlobalChatService } from '../../../chat/service/globalChat.service';
import { PlayerSchema } from '../../../player/schemas/player.schema';
import EventEmitterService from '../../../common/service/EventEmitterService/EventEmitter.service';

export default class ChatCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!ChatCommonModule.module)
      ChatCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.CHAT_MESSAGE, schema: ChatMessageSchema },
            { name: ModelName.PLAYER, schema: PlayerSchema },
          ]),

          RequestHelperModule,
          GameEventsHandlerModule,
        ],
        providers: [ChatService, ClanChatService, GlobalChatService, EventEmitterService],
      }).compile();

    return ChatCommonModule.module;
  }
}
