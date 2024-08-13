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
import { RequestHelperService } from "src/requestHelper/requestHelper.service";
import { JoinService } from "./join.service";
import { JoinDto } from "./dto/join.dto";
import { BasicPOST } from "src/common/base/decorator/BasicPOST.decorator";
import { Action } from "src/authorization/enum/action.enum";
import { Authorize } from "src/authorization/decorator/Authorize";
import { JoinRequestDto } from "./dto/joinRequest.dto";
import { ModelName } from "src/common/enum/modelName.enum";
import { MongooseError } from "mongoose";
import { BasicPUT } from "src/common/base/decorator/BasicPUT.decorator";
import { AddSearchQuery } from "src/common/interceptor/request/addSearchQuery.interceptor";
import { BasicGET } from "src/common/base/decorator/BasicGET.decorator";
import { AddSortQuery } from "src/common/interceptor/request/addSortQuery.interceptor";
import { OffsetPaginate } from "src/common/interceptor/request/offsetPagination.interceptor";
import { GetAllQuery } from "src/common/decorator/param/GetAllQuery";
import { IGetAllQuery } from "src/common/interface/IGetAllQuery";
import { JoinResultDto } from "./dto/joinResult.dto";
import { Serialize } from "src/common/interceptor/response/Serialize";
import { _idDto } from "src/common/dto/_id.dto";
import { Request } from "express";
import { PlayerLeaveClan } from "src/authorization/rule/joinRequestRules";
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
    public async create(@Body() body: JoinRequestDto) {
        return this.service.handleJoinRequest(body);
    }

    //Player requests to leave the Clan
    @Post('leave')
    @HttpCode(204)
    @Authorize({ action: Action.create, subject: PlayerLeaveClan })
    public leave(@Req() request: Request) {
        return this.service.leaveClan(request['user'].player_id);
    }

    //Player requests to leave the Clan
    @Post('remove')
    @HttpCode(204)
    @Authorize({ action: Action.create, subject: RemovePlayerDTO })
    public removePlayer(@Body() body: RemovePlayerDTO, @Req() request: Request) {
        return this.service.removePlayerFromClan(body.player_id, request['user']);
    }

    //For requests approvals
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
    public getAll(@GetAllQuery() query: IGetAllQuery, @Req() req: Request) {
        return this.service.readJoinsOfPlayer(req['user'].player_id, query);
    }
    
    @Delete('/:_id')
    @HttpCode(204)
    @Authorize({ action: Action.delete, subject: JoinResultDto })
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}