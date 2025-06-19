import mongoose from 'mongoose';
import { ChatService } from '../../../chat/chat.service';
import ChatCommonModule from './chatCommon.module';
import { ModelName } from '../../../common/enum/modelName.enum';
import { ChatMessageSchema } from '../../../chat/schema/chatMessage.schema';

export default class ChatModule {
  private constructor() {}

  static async getChatService() {
    const module = await ChatCommonModule.getModule();
    return await module.resolve(ChatService);
  }

  static getChatModel() {
    return mongoose.model(ModelName.CHAT_MESSAGE, ChatMessageSchema);
  }
}
