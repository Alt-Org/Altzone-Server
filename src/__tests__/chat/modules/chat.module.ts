import mongoose from 'mongoose';
import { ChatService } from '../../../chat/service/chat.service';
import ChatCommonModule from './chatCommon.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { ChatMessageSchema } from '../../../chat/schema/chatMessage.schema';
import { ClanChatService } from '../../../chat/service/clanChat.service';
import { GlobalChatService } from '../../../chat/service/globalChat.service';

export default class ChatModule {
  private constructor() {}

  static async getChatService() {
    const module = await ChatCommonModule.getModule();
    return await module.resolve(ChatService);
  }

  static async getClanChatService() {
    const module = await ChatCommonModule.getModule();
    return await module.resolve(ClanChatService);
  }

  static async getGlobalChatService() {
    const module = await ChatCommonModule.getModule();
    return await module.resolve(GlobalChatService);
  }

  static getChatModel() {
    return mongoose.model(ModelName.CHAT_MESSAGE, ChatMessageSchema);
  }
}
