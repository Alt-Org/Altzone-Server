import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatMessageSchema } from './schema/chatMessage.schema';
import { ChatController } from './chat.controller';
import { ChatService } from './service/chat.service';
import { ModelName } from '../common/enum/modelName.enum';
import { ChatGateway } from './chat.gateway';
import { PlayerModule } from '../player/player.module';
import { ClanChatService } from './service/clanChat.service';
import { PlayerSchema } from '../player/schemas/player.schema';
import { GlobalChatService } from './service/globalChat.service';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.PLAYER, schema: PlayerSchema },
      { name: ModelName.CHAT_MESSAGE, schema: ChatMessageSchema },
    ]),
    PlayerModule,
    RequestHelperModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ClanChatService, GlobalChatService],
  exports: [ChatService, ClanChatService],
})
export class ChatModule {}
