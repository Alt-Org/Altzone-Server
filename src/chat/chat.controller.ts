import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
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
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { IsGroupAdmin } from '../box/auth/decorator/IsGroupAdmin';
import SwaggerTags from '../common/swagger/tags/SwaggerTags.decorator';
import { UpdateChatMessageDto } from './dto/updateChatMessage.dto';
import { _idDto } from '../common/dto/_id.dto';
import { env } from 'process';
import { Environment } from '../common/service/envHandler/enum/environment.enum';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  /**
   * Get chat message history
   *
   * @remarks Retrieves chat message history based on the specified chat type.
   * Supports pagination and sorting by creation date (descending).
   */
  @ApiResponseDescription({
    success: {
      dto: ChatMessageDto,
      modelName: ModelName.CHAT_MESSAGE,
      status: 200,
      returnsArray: true,
    },
    errors: [401, 404],
    hasAuth: true,
  })
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

  /**
   * Update chat content.
   *
   * @remarks Update chat content.
   */
  @SwaggerTags('Release on 27.07.2025', 'Chat')
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [],
    hasAuth: true,
  })
  @IsGroupAdmin()
  @UniformResponse(ModelName.CHAT)
  @Patch()
  async configureBox(@Body() body: UpdateChatMessageDto) {
    

    const [_, err] = await this.service.updateOneById({
      ...body,
    });
    if (err) return [null, err];
  }

  /**
   * Delete chatmessage data.
   *
   * @remarks Delete chatmessage data.
   *
   * Notice that the chatmessage can be removed only by the box admin.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [],
  })
  @Delete('/:_id')
  @IsGroupAdmin()
  @UniformResponse(ModelName.CHAT)
  async deleteChatMessage(@Param() param: _idDto) {
    return await this.service.deleteChatMessage(param._id);
  }
}
