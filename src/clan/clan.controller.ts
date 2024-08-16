import { ClanService } from "./clan.service";
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Req
} from "@nestjs/common";
import { CreateClanDto } from "./dto/createClan.dto";
import { UpdateClanDto } from "./dto/updateClan.dto";
import { ClanDto } from "./dto/clan.dto";
import { BasicPOST } from "../common/base/decorator/BasicPOST.decorator";
import { BasicGET } from "../common/base/decorator/BasicGET.decorator";
import { AddGetQueries } from "../common/decorator/request/AddGetQueries.decorator";
import { _idDto } from "../common/dto/_id.dto";
import { BasicDELETE } from "../common/base/decorator/BasicDELETE.decorator";
import { BasicPUT } from "../common/base/decorator/BasicPUT.decorator";
import { ModelName } from "../common/enum/modelName.enum";
import { Authorize } from "../authorization/decorator/Authorize";
import { Action } from "../authorization/enum/action.enum";
import { MongooseError } from "mongoose";
import { RequestHelperService } from "../requestHelper/requestHelper.service";
import { deleteArrayElements } from "../common/function/deleteArrayElements";
import { addUniqueArrayElements } from "../common/function/addUniqueArrayElements";
import { deleteNotUniqueArrayElements } from "../common/function/deleteNotUniqueArrayElements";
import { PlayerDto } from "../player/dto/player.dto";
import { AddSearchQuery } from "../common/interceptor/request/addSearchQuery.interceptor";
import { OffsetPaginate } from "src/common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "src/common/interceptor/request/addSortQuery.interceptor";
import { GetAllQuery } from "src/common/decorator/param/GetAllQuery";
import { IGetAllQuery } from "src/common/interface/IGetAllQuery";
import { NoAuth } from "src/auth/decorator/NoAuth.decorator";

@Controller('clan')
export class ClanController {
    public constructor(
        private readonly service: ClanService,
        private readonly requestHelperService: RequestHelperService
    ) {
    }
    @Post()
    @Authorize({ action: Action.create, subject: ClanDto })
    @BasicPOST(ClanDto)
    public async create(@Body() body: CreateClanDto, @Req() request: Request) {
        return this.service.handleDefaultCreate(body, request['user']);
    }

    @Post('/default')
    @Authorize({ action: Action.create, subject: ClanDto })
    @BasicPOST(ClanDto)
    public async createDefault(@Body() body: CreateClanDto, @Req() request: Request) {
        return this.service.handleDefaultCreate(body, request['user']);
    }

    @Get('/:_id')
    @NoAuth()
    //@Authorize({ action: Action.read, subject: ClanDto })
    @BasicGET(ModelName.CLAN, ClanDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @Get()
    @NoAuth()
    //@Authorize({ action: Action.read, subject: ClanDto })
    @OffsetPaginate(ModelName.CLAN)
    @AddSearchQuery(ClanDto)
    @AddSortQuery(ClanDto)
    @BasicGET(ModelName.CLAN, ClanDto)
    public getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @Authorize({ action: Action.update, subject: UpdateClanDto })
    @BasicPUT(ModelName.CLAN)
    public async update(@Body() body: UpdateClanDto) {
        return this.service.handleUpdate(body)
    }

    @Delete('/:_id')
    @Authorize({ action: Action.delete, subject: UpdateClanDto })
    @BasicDELETE(ModelName.CLAN)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}