import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './service/chat.service';
import { ModelName } from '../common/enum/modelName.enum';
import { IGetAllQuery } from '../common/interface/IGetAllQuery';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ChatMessageDto } from './dto/chatMessage.dto';
import DetermineClanId from '../common/guard/clanId.guard';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { ChatType } from './enum/chatMessageType.enum';
import { OffsetPaginate } from '../common/interceptor/request/offsetPagination.interceptor';
import { GetAllQuery } from '../common/decorator/param/GetAllQuery';

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Get('history')
  @DetermineClanId()
  @UniformResponse(ModelName.CHAT_MESSAGE, ChatMessageDto)
  @OffsetPaginate(ModelName.CHAT_MESSAGE)
  async getClanChatHistory(
    @LoggedUser() user: User,
    @GetAllQuery() paginationQuery: IGetAllQuery,
    @Query('type') type?: ChatType,
    @Query('recipientId') recipientId?: string,
  ) {
    const query: IGetAllQuery = {
      ...paginationQuery,
      filter: {},
      sort: { createdAt: -1 },
    };

    switch (type) {
      case ChatType.CLAN:
        query.filter = {
          type: ChatType.CLAN,
          clan_id: user.clan_id,
        };
        break;

      case ChatType.PRIVATE:
        query.filter = {
          type: ChatType.PRIVATE,
          $or: [
            { sender_id: user.player_id, recipient_id: recipientId },
            { sender_id: recipientId, recipient_id: user.player_id },
          ],
        };
        break;

      default:
        query.filter = {
          type: ChatType.GLOBAL,
        };
    }

    return this.service.getMessages(query);
  }
}
