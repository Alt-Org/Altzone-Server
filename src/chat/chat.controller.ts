import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { OffsetPaginate } from '../common/interceptor/request/offsetPagination.interceptor';
import { ModelName } from '../common/enum/modelName.enum';
import { GetAllQuery } from '../common/decorator/param/GetAllQuery';
import { IGetAllQuery } from '../common/interface/IGetAllQuery';

@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Get('history')
  @OffsetPaginate(ModelName.CHAT_MESSAGE)
  async getClanChatHistory(@GetAllQuery() query: IGetAllQuery) {
    return this.service.getMessages(query);
  }
}
