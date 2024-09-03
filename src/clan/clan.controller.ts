import { ClanService } from "./clan.service";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Req
} from "@nestjs/common";
import { CreateClanDto } from "./dto/createClan.dto";
import { UpdateClanDto } from "./dto/updateClan.dto";
import { ClanDto } from "./dto/clan.dto";
import { BasicPOST } from "../common/base/decorator/BasicPOST.decorator";
import { _idDto } from "../common/dto/_id.dto";
import { ModelName } from "../common/enum/modelName.enum";
import { Authorize } from "../authorization/decorator/Authorize";
import { Action } from "../authorization/enum/action.enum";
import { AddSearchQuery } from "../common/interceptor/request/addSearchQuery.interceptor";
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "../common/interceptor/request/addSortQuery.interceptor";
import { GetAllQuery } from "../common/decorator/param/GetAllQuery";
import { IGetAllQuery } from "../common/interface/IGetAllQuery";
import { NoAuth } from "../auth/decorator/NoAuth.decorator";
import { JoinDto } from "./join/dto/join.dto";
import { JoinRequestDto } from "./join/dto/joinRequest.dto";
import { JoinService } from "./join/join.service";
import { RemovePlayerDTO } from "./join/dto/removePlayer.dto";
import { PlayerLeaveClanDto } from "./join/dto/playerLeave.dto";
import { LoggedUser } from "../common/decorator/param/LoggedUser.decorator";
import { User } from "../auth/user";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { IncludeQuery } from "../common/decorator/param/IncludeQuery.decorator";
import { publicReferences } from "./clan.schema";
import { Serialize } from "../common/interceptor/response/Serialize";

@Controller('clan')
export class ClanController {
    public constructor(
        private readonly service: ClanService,
        private readonly joinService: JoinService
    ) {
    }

    @Post()
    @Authorize({ action: Action.create, subject: ClanDto })
    @UniformResponse(ModelName.CLAN)
    public async create(@Body() body: CreateClanDto, @LoggedUser() user: User) {
        return await this.service.createOne(body, user.player_id);
    }

    @Get('/:_id')
    @NoAuth()
    @UniformResponse(ModelName.CLAN)
    public get(@Param() param: _idDto, @IncludeQuery(publicReferences) includeRefs: ModelName[]) {
        return this.service.readOneById(param._id, { includeRefs });
    }

    @Get()
    @NoAuth()
    @OffsetPaginate(ModelName.CLAN)
    @AddSearchQuery(ClanDto)
    @AddSortQuery(ClanDto)
    @Serialize(ClanDto)
    @UniformResponse(ModelName.CLAN)
    public getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @Authorize({ action: Action.update, subject: UpdateClanDto })
    @UniformResponse()
    public async update(@Body() body: UpdateClanDto) {
        const [resp, errors] = await this.service.updateOneById(body);
        if(errors)
            return [null, errors];
    }

    @Delete('/:_id')
    @Authorize({ action: Action.delete, subject: UpdateClanDto })
    @UniformResponse()
    public async delete(@Param() param: _idDto) {
        const [resp, errors] = await this.service.deleteOneById(param._id);
        if(errors)
            return [null, errors];
    }

    
    @Post('join')
    @Authorize({action: Action.create, subject: JoinDto})
    @BasicPOST(JoinDto)
    public async createJoin(@Body() body: JoinRequestDto) {
        return this.joinService.handleJoinRequest(body);
    }

    @Post('leave')
    @HttpCode(204)
    @Authorize({ action: Action.create, subject: PlayerLeaveClanDto })
    public leaveClan(@Req() request: Request) {
        return this.joinService.leaveClan(request['user'].player_id);
    }

    @Post('exclude')
    @HttpCode(204)
    @Authorize({ action: Action.create, subject: RemovePlayerDTO })
    public excludePlayer(@Body() body: RemovePlayerDTO, @Req() request: Request) {
        return this.joinService.removePlayerFromClan(body.player_id, request['user']);
    }
}