import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { RoomService } from "./room.service";
import { RequestHelperService } from "src/requestHelper/requestHelper.service";
import { BasicPOST } from "src/common/base/decorator/BasicPOST.decorator";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { NoAuth } from "src/auth/decorator/NoAuth.decorator";
import { RoomDocument } from "./room.schema";
import { RoomDto } from "./dto/room.dto";
import { BasicGET } from "src/common/base/decorator/BasicGET.decorator";
import { ModelName } from "src/common/enum/modelName.enum";
import { _idDto } from "src/common/dto/_id.dto";
import { AddGetQueries } from "src/common/decorator/request/AddGetQueries.decorator";
import { OffsetPaginate } from "src/common/interceptor/request/offsetPagination.interceptor";
import { AddSearchQuery } from "src/common/interceptor/request/addSearchQuery.interceptor";
import { AddSortQuery } from "src/common/interceptor/request/addSortQuery.interceptor";
import { GetAllQuery } from "src/common/decorator/param/GetAllQuery";
import { IGetAllQuery } from "src/common/interface/IGetAllQuery";
import { UpdateRoomDto } from "./dto/updateRoom.dto";
import { BasicPUT } from "src/common/base/decorator/BasicPUT.decorator";
import { BasicDELETE } from "src/common/base/decorator/BasicDELETE.decorator";
import { Authorize } from "src/authorization/decorator/Authorize";
import { Action } from "src/authorization/enum/action.enum";

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