import {ClanService} from "./clan.service";
import {ClassName} from "../util/dictionary";
import {Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query} from "@nestjs/common";
import {CreateClanDto} from "./dto/createClan.dto";
import {UpdateClanDto} from "./dto/updateClan.dto";
import {_idClanDto} from "./dto/_idClan.dto";
import {CatchCreateUpdateErrors} from "../decorator/CatchCreateUpdateErrors";
import {BeautifyResponse} from "../decorator/BeautifyResponse";
import {ResponseType} from "../decorator/responseType";

@Controller('clan')
export class ClanController{
    public constructor(
        private readonly service: ClanService
    ) {
    }

    @Post()
    @CatchCreateUpdateErrors()
    public create(@Body() body: CreateClanDto) {
        return this.service.create(body);
    }
    @Get('/:_id')
    @BeautifyResponse(ResponseType.READ, ClassName.CLAN)
    public async get (@Param() param: _idClanDto, @Query() query: any) {
        if(Object.keys(query).length === 0)
            return this.service.readById(param._id);
        else if(query.with && (typeof query.with == 'string'))
            return this.service.readOneWithCollections(param._id, query.with);
        else if(query.all !== null)
            return this.service.readOneWithAllCollections(param._id);
    }

    @Get()
    @BeautifyResponse(ResponseType.READ, ClassName.CLAN)
    public async getAll () {
        return this.service.readAll();
    }

    @Put()
    @HttpCode(204)
    @CatchCreateUpdateErrors()
    @BeautifyResponse(ResponseType.UPDATE, ClassName.CLAN)
    public async update (@Body() body: UpdateClanDto){
        return this.service.updateById(body);
    }

    @Delete('/:_id')
    @HttpCode(204)
    @BeautifyResponse(ResponseType.DELETE, ClassName.CLAN)
    public async delete (@Param() param: _idClanDto) {
        return this.service.deleteById(param._id);
    }
}