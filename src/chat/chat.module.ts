import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatMessageSchema } from './schema/chatMessage.schema';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ModelName } from '../common/enum/modelName.enum';
import { ChatGateway } from './clan-chat.gateway';
import { PlayerModule } from '../player/player.module';
import { ClanChatService } from './clanChat.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.CHAT_MESSAGE, schema: ChatMessageSchema },
    ]),
    PlayerModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ClanChatService],
  exports: [ChatService],
})
export class ChatModule {}
