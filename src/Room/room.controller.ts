import { Body, Controller, Get, Param, Put, Req } from "@nestjs/common";
import { RoomService } from "./room.service";
import { RoomDto } from "./dto/room.dto";
import { ModelName } from "../common/enum/modelName.enum";
import { _idDto } from "../common/dto/_id.dto";
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { AddSearchQuery } from "../common/interceptor/request/addSearchQuery.interceptor";
import { AddSortQuery } from "../common/interceptor/request/addSortQuery.interceptor";
import { GetAllQuery } from "../common/decorator/param/GetAllQuery";
import { IGetAllQuery } from "../common/interface/IGetAllQuery";
import { UpdateRoomDto } from "./dto/updateRoom.dto";
import { Authorize } from "../authorization/decorator/Authorize";
import { Action } from "../authorization/enum/action.enum";
import { UniformResponse } from "../common/decorator/response/UniformResponse";

@Controller('room')
export class RoomController {
    public constructor(
        private readonly service: RoomService
    ) {
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: RoomDto})
    @UniformResponse(ModelName.ROOM)
    public async get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneByIdAndPlayerId(param._id, request['user'].player_id);
    }

    @Get()
    @Authorize({action: Action.read, subject: RoomDto})
    @OffsetPaginate(ModelName.ROOM)
    @AddSearchQuery(RoomDto)
    @AddSortQuery(RoomDto)
    @UniformResponse(ModelName.ROOM)
    public async getAll(@GetAllQuery() query: IGetAllQuery, @Req() request: Request) {
        return this.service.readPlayerClanRooms(request['user'].player_id, query);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateRoomDto })
    @UniformResponse()
    public async update(@Body() body: UpdateRoomDto) {
        return this.service.updateOneById(body);
    }
}