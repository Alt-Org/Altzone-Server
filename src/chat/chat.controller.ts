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
import { Authorize } from '../authorization/decorator/Authorize';
import { Action } from '../authorization/enum/action.enum';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';

@Controller('chat')
export class ChatController {
  public constructor(
    private readonly service: ChatService,
    private readonly requestHelperService: RequestHelperService,
  ) {}

  /**
   * Create a chat.
   *
   * @remarks Create a new Chat. The Chat is an object containing messages.
   *
   * Notice, that currently there is no restrictions on who can create a Chat.
   *
   * Notice that the Message objects are inner objects of Chat and can not be used enewhere else than in the Chat. There is also no separate collection for the Message in the DB.
   */
  @ApiResponseDescription({
    success: {
      status: 201,
      dto: ChatDto,
      modelName: ModelName.CHAT,
    },
    errors: [400, 401, 409],
  })
  @Post()
  @Authorize({ action: Action.create, subject: ChatDto })
  @BasicPOST(ChatDto)
  public create(@Body() body: CreateChatDto) {
    return this.service.createOne(body);
  }

  /**
   * Get chat by _id.
   *
   * @remarks Get chat by _id.
   */
  @ApiResponseDescription({
    success: {
      dto: ChatDto,
      modelName: ModelName.CHAT,
    },
    errors: [404],
  })
  @Get('/:_id')
  @Authorize({ action: Action.read, subject: ChatDto })
  @BasicGET(ModelName.CHAT, ChatDto)
  @AddGetQueries()
  @UniformResponse(ModelName.CHAT, ChatDto)
  public get(@Param() param: _idDto, @Req() request: Request) {
    return this.service.readOneById(param._id, request['mongoPopulate']);
  }

  /**
   * Get all existing chats.
   *
   * @remarks Read all created Chats. Remember about the pagination.
   *
   * Notice, that use of messages array is not advised and can be removed at some point in the future.
   * For accessing messages of the Chat please use the /chat/:_id/message endpoint.
   */
  @ApiResponseDescription({
    success: {
      dto: ChatDto,
      modelName: ModelName.CHAT,
      returnsArray: true,
    },
    errors: [404],
  })
  @Get()
  @Authorize({ action: Action.read, subject: ChatDto })
  @UniformResponse(ModelName.CHAT, ChatDto)
  @OffsetPaginate(ModelName.CHAT)
  @AddSearchQuery(ChatDto)
  @AddSortQuery(ChatDto)
  @BasicGET(ModelName.CHAT, ChatDto)
  public getAll(@GetAllQuery() query: IGetAllQuery) {
    return this.service.readAll(query);
  }

  /**
   * Update chat by _id
   *
   * @remarks Update the Chat, which _id is specified in the body.
   *
   * Notice that currently anybody is able to change any Chat.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 404, 409],
  })
  @Put()
  @Authorize({ action: Action.update, subject: UpdateChatDto })
  @BasicPUT(ModelName.CHAT)
  public update(@Body() body: UpdateChatDto) {
    return this.service.updateOneById(body);
  }

  /**
   * Delete chat by _id
   *
   * @remarks Delete Chat by its _id field.
   *
   * Notice that currently anybody can delete any Chat.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 404],
  })
  @Delete('/:_id')
  @Authorize({ action: Action.delete, subject: UpdateChatDto })
  @BasicDELETE(ModelName.CHAT)
  public delete(@Param() param: _idDto) {
    return this.service.deleteOneById(param._id);
  }

  /**
   * Create a new Message
   *
   * @remarks Create a new Message. Message represent the object of message sent by a Player.
   *
   * Notice that currently there are no authorization required.
   *
   * Notice, that the messages does not have an usual _id field generated by data base. Instead the Photon id should be used.
   *
   * Notice that the messages is contained in the array of a Chat collection.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 404, 409],
  })
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

  /**
   * Read a messages of a Chat by _id
   *
   * @remarks Read a message by _id
   */
  @ApiResponseDescription({
    success: {
      dto: MessageDto,
      modelName: ModelName.CHAT,
    },
    errors: [400, 404],
  })
  @Get('/:chat_id/messages/:_id')
  @Authorize({ action: Action.read, subject: MessageDto })
  @BasicGET(APIObjectName.MESSAGE, MessageDto)
  public getMessage(@Param() param: messageParam) {
    return this.service.readOneMessageById(param.chat_id, param._id);
  }

  /**
   * Read all messages of a Chat
   *
   * @remarks Read all messages of specified Chat. Remember about the pagination
   */
  @ApiResponseDescription({
    success: {
      dto: MessageDto,
      modelName: ModelName.CHAT,
      returnsArray: true,
    },
    errors: [400, 404],
  })
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
