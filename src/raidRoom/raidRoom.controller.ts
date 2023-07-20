import {Body, Controller, Delete, Get, Param, Post, Put, Query} from "@nestjs/common";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {GetQueryDto} from "../common/dto/getQuery.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {RaidRoomService} from "./raidRoom.service";
import {RaidRoomDto} from "./dto/raidRoom.dto";
import {CreateRaidRoomDto} from "./dto/createRaidRoom.dto";
import {UpdateRaidRoomDto} from "./dto/updateRaidRoom.dto";

@Controller('raidRoom')
export class RaidRoomController{
    public constructor(
        private readonly service: RaidRoomService
    ) {
    }

    @Post()
    @BasicPOST(RaidRoomDto)
    public create(@Body() body: CreateRaidRoomDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @BasicGET(ModelName.RAID_ROOM, RaidRoomDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Query() query: GetQueryDto) {
        return this.service.readOneById(param._id);
    }

    @Get()
    @BasicGET(ModelName.RAID_ROOM, RaidRoomDto)
    public getAll() {
        return this.service.readAll();
    }

    @Put()
    @BasicPUT(ModelName.RAID_ROOM)
    public update(@Body() body: UpdateRaidRoomDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @BasicDELETE(ModelName.RAID_ROOM)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}