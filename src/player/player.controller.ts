import {Body, Controller, Delete, Get, Param, Post, Put, Query} from "@nestjs/common";
import {PlayerService} from "./player.service";
import {CreatePlayerDto} from "./dto/createPlayer.dto";
import {UpdatePlayerDto} from "./dto/updatePlayer.dto";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {PlayerDto} from "./dto/player.dto";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {GetQueryDto} from "../common/dto/getQuery.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";

@Controller('player')
export default class PlayerController{
    public constructor(private readonly service: PlayerService) {
    }

    @Post()
    @BasicPOST(PlayerDto)
    public create(@Body() body: CreatePlayerDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @BasicGET(ModelName.PLAYER, PlayerDto)
    @AddGetQueries()
    public async get(@Param() param: _idDto, @Query() query: GetQueryDto) {
        return this.service.readOneById(param._id);
    }

    @Get()
    @BasicGET(ModelName.PLAYER, PlayerDto)
    public async getAll() {
        return this.service.readAll();
    }

    @Put()
    @BasicPUT(ModelName.PLAYER)
    public async update(@Body() body: UpdatePlayerDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @BasicDELETE(ModelName.PLAYER)
    public async delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}