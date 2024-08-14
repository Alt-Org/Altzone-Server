import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { RequestHelperService } from "../requestHelper/requestHelper.service";
import { BasicPOST } from "../common/base/decorator/BasicPOST.decorator";
import { NoAuth } from "../auth/decorator/NoAuth.decorator";
import { BasicGET } from "../common/base/decorator/BasicGET.decorator";
import { ModelName } from "../common/enum/modelName.enum";
import { _idDto } from "../common/dto/_id.dto";
import { AddGetQueries } from "../common/decorator/request/AddGetQueries.decorator";
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { AddSearchQuery } from "../common/interceptor/request/addSearchQuery.interceptor";
import { AddSortQuery } from "../common/interceptor/request/addSortQuery.interceptor";
import { GetAllQuery } from "../common/decorator/param/GetAllQuery";
import { IGetAllQuery } from "../common/interface/IGetAllQuery";
import { BasicPUT } from "../common/base/decorator/BasicPUT.decorator";
import { BasicDELETE } from "../common/base/decorator/BasicDELETE.decorator";
import { CreateSoulHomeDto } from "./dto/createSoulHome.dto";
import { SoulHomeDto } from "./dto/soulhome.dto";
import { updateSoulHomeDto } from "./dto/updateSoulHome.dto";
import { AuthorizationInterceptor } from "../authorization/authorization.interceptor";
import { subject } from "@casl/ability";
import { Authorize } from "../authorization/decorator/Authorize";
import { Action } from "../authorization/enum/action.enum";
import { SoulHomeService } from "./soulhome.service";

@Controller('soulhome')
export class SoulHomeController {
    public constructor(
        private readonly service: SoulHomeService,
        private readonly requestHelperService: RequestHelperService
    ) {
    }

    @Post()
    @Authorize({action: Action.create, subject: SoulHomeDto})
    @BasicPOST(CreateSoulHomeDto)
    public async create(@Body() body: CreateSoulHomeDto, @Req() request: Request) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: SoulHomeDto})
    @BasicGET(ModelName.SOULHOME, SoulHomeDto)
    @AddGetQueries()
    public async get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

  
    @Get()
    @Authorize({ action: Action.read, subject: SoulHomeDto })
    @OffsetPaginate(ModelName.SOULHOME)
    @AddSearchQuery(SoulHomeDto)
    @AddSortQuery(SoulHomeDto)
    @BasicGET(ModelName.SOULHOME, SoulHomeDto )
    public getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }
    
    @Put()
    @Authorize({action: Action.update, subject: updateSoulHomeDto})
    @BasicPUT(ModelName.SOULHOME)
    public async update(@Body() body: updateSoulHomeDto) {
        return this.service.handleUpdate(body);
    }
    
    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: updateSoulHomeDto})
    @BasicDELETE(ModelName.SOULHOME)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }

}