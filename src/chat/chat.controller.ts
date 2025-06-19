import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ModelName } from '../common/enum/modelName.enum';
import { IGetAllQuery } from '../common/interface/IGetAllQuery';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ChatMessageDto } from './dto/chatMessage.dto';
import DetermineClanId from '../common/guard/clanId.guard';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { ChatMessageType } from './enum/chatMessageType.enum';

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Get('history')
  @DetermineClanId()
  @UniformResponse(ModelName.CHAT_MESSAGE, ChatMessageDto)
  async getClanChatHistory(
    @LoggedUser() user: User,
    @Query('type') type?: ChatMessageType,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
    @Query('recipientId') recipientId?: string,
  ) {
    const query: IGetAllQuery = {
      filter: {},
      limit: limit ?? 50,
      skip: skip ?? 0,
      sort: { createdAt: -1 },
    };

    switch (type) {
      case ChatMessageType.CLAN:
        query.filter = {
          type: ChatMessageType.CLAN,
          clan_id: user.clan_id,
        };
        break;

      case ChatMessageType.PRIVATE:
        query.filter = {
          type: ChatMessageType.PRIVATE,
          $or: [
            { sender_id: user.player_id, recipient_id: recipientId },
            { sender_id: recipientId, recipient_id: user.player_id },
          ],
        };
        break;

      default:
        query.filter = {
          type: ChatMessageType.GLOBAL,
        };
    }

    return this.service.getMessages(query);
  }
}
