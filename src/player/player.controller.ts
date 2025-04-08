import {Body, Controller, Delete, Get, Param, Post, Put} from "@nestjs/common";
import {PlayerService} from "./player.service";
import {CreatePlayerDto} from "./dto/createPlayer.dto";
import {UpdatePlayerDto} from "./dto/updatePlayer.dto";
import {PlayerDto} from "./dto/player.dto";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {NoAuth} from "../auth/decorator/NoAuth.decorator";
import {CatchCreateUpdateErrors} from "../common/decorator/response/CatchCreateUpdateErrors";
import {Serialize} from "../common/interceptor/response/Serialize";
import {Authorize} from "../authorization/decorator/Authorize";
import {Action} from "../authorization/enum/action.enum";
import {OffsetPaginate} from "../common/interceptor/request/offsetPagination.interceptor";
import {AddSearchQuery} from "../common/interceptor/request/addSearchQuery.interceptor";
import {GetAllQuery} from "../common/decorator/param/GetAllQuery";
import {IGetAllQuery} from "../common/interface/IGetAllQuery";
import {AddSortQuery} from "../common/interceptor/request/addSortQuery.interceptor";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { publicReferences } from "./player.schema";
import {IncludeQuery} from "../common/decorator/param/IncludeQuery.decorator";

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
    @Serialize(PlayerDto)
    @UniformResponse(ModelName.PLAYER)
    @Authorize({action: Action.read, subject: PlayerDto})
    public async get(@Param() param: _idDto, @IncludeQuery(publicReferences) includeRefs: ModelName[]) {
        return this.service.getPlayerById(param._id, { includeRefs });
    }

    @Get()
    @Authorize({action: Action.read, subject: PlayerDto})
    @OffsetPaginate(ModelName.PLAYER)
    @AddSearchQuery(PlayerDto)
    @AddSortQuery(PlayerDto)
    @BasicGET(ModelName.PLAYER, PlayerDto)
    public async getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
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