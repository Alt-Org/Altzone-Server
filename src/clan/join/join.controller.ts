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
@Controller("clan/join")
export class joinController {
    public constructor(
        private readonly service: JoinService,
        private readonly requestHelperService: RequestHelperService
    ) {
    }
    @Post()
    @Authorize({action: Action.create, subject: JoinDto})
    @BasicPOST(JoinDto)
    public async create(@Body() body: JoinRequestDto, @Req() request: Request) {
        return this.service.handleJoinRequest(body,request);
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
        return this.service.readAll(query);
    }
    @Delete('/:_id')
    @Authorize({ action: Action.delete, subject: JoinResultDto })
    public delete(@Param() param: _idDto) {
        return this.service.leaveClan(param);
    }

}