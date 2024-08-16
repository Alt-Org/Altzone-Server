import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Post,
    Put,
    Req
} from "@nestjs/common";
import { RequestHelperService } from "../../requestHelper/requestHelper.service";
import { JoinService } from "./join.service";
import { JoinDto } from "./dto/join.dto";
import { BasicPOST } from "../../common/base/decorator/BasicPOST.decorator";
import { Action } from "../../authorization/enum/action.enum";
import { Authorize } from "../../authorization/decorator/Authorize";
import { JoinRequestDto } from "./dto/joinRequest.dto";
import { ModelName } from "../../common/enum/modelName.enum";
import { MongooseError } from "mongoose";
import { BasicPUT } from "../../common/base/decorator/BasicPUT.decorator";
import { AddSearchQuery } from "../../common/interceptor/request/addSearchQuery.interceptor";
import { BasicGET } from "../../common/base/decorator/BasicGET.decorator";
import { AddSortQuery } from "../../common/interceptor/request/addSortQuery.interceptor";
import { OffsetPaginate } from "../../common/interceptor/request/offsetPagination.interceptor";
import { GetAllQuery } from "../../common/decorator/param/GetAllQuery";
import { IGetAllQuery } from "../../common/interface/IGetAllQuery";
import { JoinResultDto } from "./dto/joinResult.dto";
import { Serialize } from "../../common/interceptor/response/Serialize";
import { _idDto } from "../../common/dto/_id.dto";
import { Request } from "express";
import { PlayerLeaveClan } from "../../authorization/rule/joinRequestRules";
import { RemovePlayerDTO } from "./dto/removePlayer.dto";
@Controller("clan/join")
export class joinController {
    public constructor(
        private readonly service: JoinService,
        private readonly requestHelperService: RequestHelperService
    ) {
    }
    //Send request to join the clan. if it is an open clan, player will be joined automatically
    @Post()
    @Authorize({action: Action.create, subject: JoinDto})
    @BasicPOST(JoinDto)
    public async create(@Body() body: JoinRequestDto, @Req() request: Request) {
        return this.service.handleJoinRequest(body, request['user']);
    }

    //Player requests to leave the Clan
    @Post('leave')
    @HttpCode(204)
    @Authorize({ action: Action.create, subject: PlayerLeaveClan })
    public leave(@Req() request: Request) {
        return this.service.leaveClanByPlayer(request['user']);
    }

    //Player requests to leave the Clan
    @Post('remove')
    @HttpCode(204)
    @Authorize({ action: Action.create, subject: PlayerLeaveClan })
    public removePlayer(@Body() body: RemovePlayerDTO, @Req() request: Request) {
        return this.service.removePlayerFromClan(body.player_id, request['user']);
    }

    @Put()
    @Authorize({ action: Action.update, subject: JoinResultDto})
    @BasicPUT(ModelName.JOIN)
    public async update(@Body() body: JoinResultDto) {
        return this.service.updateOneById(body);
    }

    @Get()
    @Authorize({action: Action.read, subject: JoinDto})
    @OffsetPaginate(ModelName.JOIN)
    @AddSearchQuery(JoinDto)
    @AddSortQuery(JoinDto)
    @BasicGET(ModelName.JOIN, JoinDto)
    public getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readJoinsByUser(query);
    }
    
    @Delete('/:_id')
    @Authorize({ action: Action.delete, subject: JoinResultDto })
    public delete(@Param() param: _idDto) {
        return this.service.leaveClan(param._id);
    }

}