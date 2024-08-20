import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { RoomService } from "./room.service";
import { RequestHelperService } from "../requestHelper/requestHelper.service";
import { BasicPOST } from "../common/base/decorator/BasicPOST.decorator";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { NoAuth } from "../auth/decorator/NoAuth.decorator";
import { RoomDocument } from "./room.schema";
import { RoomDto } from "./dto/room.dto";
import { BasicGET } from "../common/base/decorator/BasicGET.decorator";
import { ModelName } from "../common/enum/modelName.enum";
import { _idDto } from "../common/dto/_id.dto";
import { AddGetQueries } from "../common/decorator/request/AddGetQueries.decorator";
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { AddSearchQuery } from "../common/interceptor/request/addSearchQuery.interceptor";
import { AddSortQuery } from "../common/interceptor/request/addSortQuery.interceptor";
import { GetAllQuery } from "../common/decorator/param/GetAllQuery";
import { IGetAllQuery } from "../common/interface/IGetAllQuery";
import { UpdateRoomDto } from "./dto/updateRoom.dto";
import { BasicPUT } from "../common/base/decorator/BasicPUT.decorator";
import { BasicDELETE } from "../common/base/decorator/BasicDELETE.decorator";
import { Authorize } from "../authorization/decorator/Authorize";
import { Action } from "../authorization/enum/action.enum";

@Controller('Room')
export class RoomController {
    public constructor(
        private readonly service: RoomService,
        private readonly requestHelperService: RequestHelperService
    ) {
    }

    @Post()
    @Authorize({action: Action.create, subject: RoomDto})
    @BasicPOST(CreateRoomDto)
    public async create(@Body() body: CreateRoomDto, @Req() request: Request) {
        return  this.service.createOne(body);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: RoomDto})
    @BasicGET(ModelName.ROOM, RoomDto)
    @AddGetQueries()
    public async get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @Get()
    @Authorize({action: Action.read, subject: RoomDto})
    @OffsetPaginate(ModelName.ROOM)
    @AddSearchQuery(RoomDto)
    @AddSortQuery(RoomDto)
    @BasicGET(ModelName.ROOM, RoomDto)
    public async getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateRoomDto })
    @BasicPUT(ModelName.ROOM)
    public async update(@Body() body: UpdateRoomDto) {
        return this.service.handleUpdate(body);
    }
    
    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: UpdateRoomDto})
    @BasicDELETE(ModelName.ROOM)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }

}