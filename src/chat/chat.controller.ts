import { ChatService } from './chat.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CreateChatDto } from './dto/createChat.dto';
import { UpdateChatDto } from './dto/updateChat.dto';
import { ChatDto } from './dto/chat.dto';
import { BasicPOST } from '../common/base/decorator/BasicPOST.decorator';
import { BasicGET } from '../common/base/decorator/BasicGET.decorator';
import { AddGetQueries } from '../common/decorator/request/AddGetQueries.decorator';
import { _idDto } from '../common/dto/_id.dto';
import { BasicDELETE } from '../common/base/decorator/BasicDELETE.decorator';
import { BasicPUT } from '../common/base/decorator/BasicPUT.decorator';
import { ModelName } from '../common/enum/modelName.enum';
import { RequestHelperService } from '../requestHelper/requestHelper.service';
import { AddSearchQuery } from '../common/interceptor/request/addSearchQuery.interceptor';
import { GetAllQuery } from '../common/decorator/param/GetAllQuery';
import { IGetAllQuery } from '../common/interface/IGetAllQuery';
import { OffsetPaginate } from '../common/interceptor/request/offsetPagination.interceptor';
import { AddSortQuery } from '../common/interceptor/request/addSortQuery.interceptor';
import { CreateMessageDto } from './dto/createMessage.dto';
import { MessageDto } from './dto/message.dto';
import { chat_idParam, messageParam } from './dto/messageParam';
import { APIObjectName } from '../common/enum/apiObjectName.enum';
import { Serialize } from '../common/interceptor/response/Serialize';
import { Authorize } from '../authorization/decorator/Authorize';
import { Action } from '../authorization/enum/action.enum';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';

@Controller('chat')
export class ChatController {
  public constructor(
    private readonly service: ChatService,
    private readonly requestHelperService: RequestHelperService,
  ) {}

  @Post()
  @Authorize({ action: Action.create, subject: ChatDto })
  @BasicPOST(ChatDto)
  public create(@Body() body: CreateChatDto) {
    return this.service.createOne(body);
  }

  @Serialize(ChatDto)
  @Get('/:_id')
  @Authorize({ action: Action.read, subject: ChatDto })
  @BasicGET(ModelName.CHAT, ChatDto)
  @AddGetQueries()
  public get(@Param() param: _idDto, @Req() request: Request) {
    return this.service.readOneById(param._id, request['mongoPopulate']);
  }

  @Get()
  @Authorize({ action: Action.read, subject: ChatDto })
  @Serialize(ChatDto)
  @OffsetPaginate(ModelName.CHAT)
  @AddSearchQuery(ChatDto)
  @AddSortQuery(ChatDto)
  @BasicGET(ModelName.CHAT, ChatDto)
  public getAll(@GetAllQuery() query: IGetAllQuery) {
    return this.service.readAll(query);
  }

  @Put()
  @Authorize({ action: Action.update, subject: UpdateChatDto })
  @BasicPUT(ModelName.CHAT)
  public update(@Body() body: UpdateChatDto) {
    return this.service.updateOneById(body);
  }

  @Delete('/:_id')
  @Authorize({ action: Action.delete, subject: UpdateChatDto })
  @BasicDELETE(ModelName.CHAT)
  public delete(@Param() param: _idDto) {
    return this.service.deleteOneById(param._id);
  }

  @Post('/:chat_id/messages')
  @Authorize({ action: Action.create, subject: ChatDto })
  @HttpCode(204)
  @BasicPOST(ChatDto)
  public createMessage(
    @Param() param: chat_idParam,
    @Body() body: CreateMessageDto,
    @LoggedUser() user: User,
  ) {
    return this.service.handleCreateMessage(
      param.chat_id,
      body,
      user.player_id,
    );
  }

  @Get('/:chat_id/messages/:_id')
  @Authorize({ action: Action.read, subject: MessageDto })
  @BasicGET(APIObjectName.MESSAGE, MessageDto)
  public getMessage(@Param() param: messageParam) {
    return this.service.readOneMessageById(param.chat_id, param._id);
  }

  @Get('/:chat_id/messages')
  @Authorize({ action: Action.read, subject: MessageDto })
  @OffsetPaginate(ModelName.CHAT)
  @AddSearchQuery(MessageDto)
  @AddSortQuery(MessageDto)
  @BasicGET(APIObjectName.MESSAGE, MessageDto)
  public getAllMessages(
    @Param() param: chat_idParam,
    @GetAllQuery() query: IGetAllQuery,
  ) {
    return this.service.readAllMessages(param.chat_id, query);
  }

  // @Put('/:chat_id/messages')
  // @BasicPUT(ModelName.CHAT)
  // public async updateMessage(@Param() param: chat_idParam, @Body() body: UpdateMessageDto) {
  //     return this.service.updateOneMessageById(param.chat_id, body);
  // }
  //
  // @Delete('/:chat_id/messages/:_id')
  // @BasicDELETE(ModelName.CHAT)
  // public deleteMessage(@Param() param: messageParam) {
  //     return this.service.deleteOneMessageById(param.chat_id, param._id);
  // }
}
