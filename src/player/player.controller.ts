import {BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req} from "@nestjs/common";
import {PlayerService} from "./player.service";
import {CreatePlayerDto} from "./dto/createPlayer.dto";
import {UpdatePlayerDto} from "./dto/updatePlayer.dto";
import {PlayerDto} from "./dto/player.dto";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {GetQueryDto} from "../common/dto/getQuery.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {NoAuth} from "../auth/decorator/NoAuth.decorator";
import {CatchCreateUpdateErrors} from "../common/decorator/response/CatchCreateUpdateErrors";
import {Serialize} from "../common/interceptor/response/Serialize";
import {Authorize} from "../authorization/decorator/Authorize";
import {Action} from "../authorization/enum/action.enum";
import {ClanDto} from "../clan/dto/clan.dto";
import {RequestHelperService} from "../requestHelper/requestHelper.service";

@Controller('player')
export default class PlayerController{
    public constructor(private readonly service: PlayerService) {
    }

    @NoAuth()
    @Post()
    @CatchCreateUpdateErrors()
    @Serialize(PlayerDto)
    public create(@Body() body: CreatePlayerDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: PlayerDto})
    @BasicGET(ModelName.PLAYER, PlayerDto)
    @AddGetQueries()
    public async get(@Param() param: _idDto, @Query() query: GetQueryDto) {
        return this.service.readOneById(param._id);
    }

    @Get()
    @Authorize({action: Action.read, subject: PlayerDto})
    @BasicGET(ModelName.PLAYER, PlayerDto)
    public async getAll(@Req() request: Request) {
        return this.service.readAll(request['allowedFields']);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdatePlayerDto})
    @BasicPUT(ModelName.PLAYER)
    public async update(@Body() body: UpdatePlayerDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: PlayerDto})
    @BasicDELETE(ModelName.PLAYER)
    public async delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}