import {ChatService} from "./chat.service";
import {
    Body,
    Controller,
    Delete,
    Get, HttpCode,
    NotImplementedException,
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
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "../common/interceptor/request/addSortQuery.interceptor";
import {NoAuth} from "../auth/decorator/NoAuth.decorator";
import {CreateMessageDto} from "./dto/createMessage.dto";
import {MessageDto} from "./dto/message.dto";
import {chat_idParam, messageParam} from "./dto/messageParam";
import {APIObjectName} from "../common/enum/apiObjectName.enum";
import { Serialize } from "../common/interceptor/response/Serialize";


@Controller('chat')
export class ChatController {
    public constructor(
        private readonly service: ChatService,
        private readonly requestHelperService: RequestHelperService
    ) {
    }

    @NoAuth()
    @Post()
    // @BasicPOST(ChatDto)
    public create(
       // @Body() body: CreateChatDto
    ) {
        throw new NotImplementedException();
        //return this.service.createOne(body);
    }

    @NoAuth()
    // @Serialize(ChatDto)
    @Get('/:_id')
    // @BasicGET(ModelName.CHAT, ChatDto)
    // @AddGetQueries()
    public get(
        //@Param() param: _idDto, 
        //@Req() request: Request
    ) {
        throw new NotImplementedException();
        //return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @NoAuth()
    @Get()
    // @Serialize(ChatDto)
    // @OffsetPaginate(ModelName.CHAT)
    // @AddSearchQuery(ChatDto)
    // @AddSortQuery(ChatDto)
    // @BasicGET(ModelName.CHAT, ChatDto)
    public getAll(
        //@GetAllQuery() query: IGetAllQuery
    ) {
        throw new NotImplementedException();
        //return this.service.readAll(query);
    }

    @NoAuth()
    @Put()
    // @BasicPUT(ModelName.CHAT)
    public update(
        //@Body() body: UpdateChatDto
    ) {
        throw new NotImplementedException();
        //return this.service.updateOneById(body);
    }

    @NoAuth()
    @Delete('/:_id')
    // @BasicDELETE(ModelName.CHAT)
    public delete(@Param() param: _idDto) {
        throw new NotImplementedException();
        //return this.service.deleteOneById(param._id);
    }

    @NoAuth()
    @Post('/:chat_id/messages')
    // @HttpCode(204)
    // @BasicPOST(ChatDto)
    public createMessage(
       // @Param() param: chat_idParam, 
       // @Body() body: CreateMessageDto
    ) {
        throw new NotImplementedException();
        //return this.service.createMessage(param.chat_id, body);
    }

    @NoAuth()
    @Get('/:chat_id/messages/:_id')
    // @BasicGET(APIObjectName.MESSAGE, MessageDto)
    public getMessage(
       // @Param() param: messageParam
    ) {
        throw new NotImplementedException();
        //return this.service.readOneMessageById(param.chat_id, param._id);
    }

    @NoAuth()
    @Get('/:chat_id/messages')
    // @OffsetPaginate(ModelName.CHAT)
    // @AddSearchQuery(MessageDto)
    // @AddSortQuery(MessageDto)
    // @BasicGET(APIObjectName.MESSAGE, MessageDto)
    public getAllMessages(
        //@Param() param: chat_idParam, 
        //@GetAllQuery() query: IGetAllQuery
    ) {
        throw new NotImplementedException();
        //return this.service.readAllMessages(param.chat_id, query);
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