import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {ClassName} from "../util/dictionary";
import {Body, Controller, Delete, Get, Param, Post, Put, Query} from "@nestjs/common";
import {PlayerService} from "./player.service";
import {CreatePlayerDto} from "./dto/createPlayer.dto";
import {UpdatePlayerDto} from "./dto/updatePlayer.dto";
import {_idDto} from "../requestHelper/dto/_id.dto";
import {PlayerDto} from "./dto/player.dto";
import {BasicPOST} from "../base/decorator/BasicPOST.decorator";
import {BasicGET} from "../base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../requestHelper/decorator/AddGetQueries.decorator";
import {BasicPUT} from "../base/decorator/BasicPUT.decorator";
import {BasicDELETE} from "../base/decorator/BasicDELETE.decorator";
import {GetQueryDto} from "../requestHelper/dto/getQuery.dto";

@Controller('player')
export default class PlayerController{
    public constructor(private readonly service: PlayerService) {
        this.errorThrower = new DefaultResponseErrorThrower(ClassName.PLAYER);
    }

    private readonly errorThrower: DefaultResponseErrorThrower;

    @Post()
    @BasicPOST(PlayerDto)
    public create(@Body() body: CreatePlayerDto) {
        return this.service.create(body);
    }

    @Get('/:_id')
    @BasicGET(ClassName.PLAYER, PlayerDto)
    @AddGetQueries()
    public async get(@Param() param: _idDto, @Query() query: GetQueryDto) {
        return this.service.readById(param._id);
    }

    @Get()
    @BasicGET(ClassName.PLAYER, PlayerDto)
    public async getAll() {
        return this.service.readAll();
    }

    @Put()
    @BasicPUT(ClassName.PLAYER)
    public async update(@Body() body: UpdatePlayerDto){
        return this.service.updateById(body);
    }

    @Delete('/:_id')
    @BasicDELETE(ClassName.PLAYER)
    public async delete(@Param() param: _idDto) {
        return this.service.deleteById(param._id);
    }
}