import {ChatService} from "./chat.service";
import {
    Body,
    Controller,
    Delete,
    Get, HttpCode,
    Param,
    Post,
    Put,
    Req
} from "@nestjs/common";
import {CreateChatDto} from "./dto/createChat.dto";
import {UpdateChatDto} from "./dto/updateChat.dto";
import {ChatDto} from "./dto/chat.dto";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {AddSearchQuery} from "../common/interceptor/request/addSearchQuery.interceptor";
import {GetAllQuery} from "../common/decorator/param/GetAllQuery";
import {IGetAllQuery} from "../common/interface/IGetAllQuery";
import { OffsetPaginate } from "src/common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "src/common/interceptor/request/addSortQuery.interceptor";
import {NoAuth} from "../auth/decorator/NoAuth.decorator";
import {CreateMessageDto} from "./dto/createMessage.dto";
import {MessageDto} from "./dto/message.dto";
import {UpdateMessageDto} from "./dto/updateMessage.dto";
import {chat_idParam, messageParam} from "./dto/messageParam";
import {APIObjectName} from "../common/enum/apiObjectName.enum";

@NoAuth()
@Controller('chat')
export class ChatController {
    public constructor(
        private readonly service: ChatService,
        private readonly requestHelperService: RequestHelperService
    ) {
    }

    @Post()
    @BasicPOST(ChatDto)
    public async create(@Body() body: CreateChatDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @BasicGET(ModelName.CHAT, ChatDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @Get()
    @OffsetPaginate(ModelName.CHAT)
    @AddSearchQuery(ChatDto)
    @AddSortQuery(ChatDto)
    @BasicGET(ModelName.CHAT, ChatDto)
    public getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @BasicPUT(ModelName.CHAT)
    public async update(@Body() body: UpdateChatDto) {
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @BasicDELETE(ModelName.CHAT)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }


    @Post('/:chat_id/messages')
    @HttpCode(204)
    @BasicPOST(ChatDto)
    public async createMessage(@Param() param: chat_idParam, @Body() body: CreateMessageDto) {
        return this.service.createMessage(param.chat_id, body);
    }

    @Get('/:chat_id/messages/:_id')
    @BasicGET(APIObjectName.MESSAGE, MessageDto)
    public getMessage(@Param() param: messageParam) {
        return this.service.readOneMessageById(param.chat_id, param._id);
    }

    @Get('/:chat_id/messages')
    @OffsetPaginate(ModelName.CHAT)
    @AddSearchQuery(MessageDto)
    @AddSortQuery(MessageDto)
    @BasicGET(APIObjectName.MESSAGE, MessageDto)
    public getAllMessages(@Param() param: chat_idParam, @GetAllQuery('lol') query: IGetAllQuery) {
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