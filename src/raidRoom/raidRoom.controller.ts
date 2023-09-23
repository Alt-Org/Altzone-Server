import {Body, Controller, Delete, Get, Param, Post, Put, Req} from "@nestjs/common";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {RaidRoomService} from "./raidRoom.service";
import {RaidRoomDto} from "./dto/raidRoom.dto";
import {CreateRaidRoomDto} from "./dto/createRaidRoom.dto";
import {UpdateRaidRoomDto} from "./dto/updateRaidRoom.dto";
import { Authorize } from "src/authorization/decorator/Authorize";
import { Action } from "src/authorization/enum/action.enum";
import {AddSearchQuery} from "../common/interceptor/request/addSearchQuery.interceptor";
import {GetAllQuery} from "../common/decorator/param/GetAllQuery";
import {IGetAllQuery} from "../common/interface/IGetAllQuery";

@Controller('raidRoom')
export class RaidRoomController{
    public constructor(private readonly service: RaidRoomService) {
    }

    @Post()
    @Authorize({action: Action.create, subject: RaidRoomDto})
    @BasicPOST(RaidRoomDto)
    public create(@Body() body: CreateRaidRoomDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: RaidRoomDto})
    @BasicGET(ModelName.RAID_ROOM, RaidRoomDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @Get()
    @Authorize({action: Action.read, subject: RaidRoomDto})
    @AddSearchQuery(RaidRoomDto)
    @BasicGET(ModelName.RAID_ROOM, RaidRoomDto)
    public getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateRaidRoomDto})
    @BasicPUT(ModelName.RAID_ROOM)
    public update(@Body() body: UpdateRaidRoomDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: UpdateRaidRoomDto})
    @BasicDELETE(ModelName.RAID_ROOM)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}