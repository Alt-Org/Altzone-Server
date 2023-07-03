import {ClanService} from "./clan.service";
import {ClassName} from "../util/dictionary";
import {Body, Controller, Delete, Get, Param, Post, Put, Query} from "@nestjs/common";
import {CreateClanDto} from "./dto/createClan.dto";
import {UpdateClanDto} from "./dto/updateClan.dto";
import {_idDto} from "./dto/_id.dto";
import {BasicPOST} from "../base/decorator/BasicPOST.decorator";
import {BasicGET} from "../base/decorator/BasicGET.decorator";
import {BasicPUT} from "../base/decorator/BasicPUT.decorator";
import {BasicDELETE} from "../base/decorator/BasicDELETE.decorator";

@Controller('clan')
export class ClanController{
    public constructor(
        private readonly service: ClanService
    ) {
    }

    @Post()
    @BasicPOST()
    public create(@Body() body: CreateClanDto) {
        return this.service.create(body);
    }

    @Get('/_id')
    @BasicGET(ClassName.CLAN)
    public async get(@Param() param: _idDto, @Query() query: any) {
        if(Object.keys(query).length === 0)
            return this.service.readById(param._id);
        else if(query.with && (typeof query.with === 'string'))
            return this.service.readOneWithCollections(param._id, query.with);
        else if(query.all !== null)
            return this.service.readOneWithAllCollections(param._id);
    }

    @Get()
    @BasicGET(ClassName.CLAN)
    public async getAll() {
        return this.service.readAll();
    }

    @Put()
    @BasicPUT(ClassName.CLAN)
    public async update(@Body() body: UpdateClanDto){
        return this.service.updateById(body);
    }

    @Delete('_id')
    @BasicDELETE(ClassName.CLAN)
    public async delete(@Param() param: _idDto) {
        return this.service.deleteById(param._id);
    }
}