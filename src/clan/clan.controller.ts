import {ClanService} from "./clan.service";
import {ClassName} from "../util/dictionary";
import {Body, Controller, Param, Query} from "@nestjs/common";
import {CreateClanDto} from "./dto/createClan.dto";
import {UpdateClanDto} from "./dto/updateClan.dto";
import {_idDto} from "./dto/_id.dto";
import {AddBaseCreateDecorators} from "../base/decorator/AddBaseCreateDecorators";
import {AddBaseGetOneByIdDecorators} from "../base/decorator/AddBaseGetOneByIdDecorators";
import {AddBaseGetAllDecorators} from "../base/decorator/AddBaseGetAllDecorators";
import {AddBaseUpdateOneDecorators} from "../base/decorator/AddBaseUpdateOneDecorators";
import {AddBaseDeleteOneByIdDecorators} from "../base/decorator/AddBaseDeleteOneByIdDecorators";

@Controller('clan')
export class ClanController{
    public constructor(
        private readonly service: ClanService
    ) {
    }

    @AddBaseCreateDecorators()
    public create(@Body() body: CreateClanDto) {
        return this.service.create(body);
    }
    @AddBaseGetOneByIdDecorators(ClassName.CLAN)
    public async get(@Param() param: _idDto, @Query() query: any) {
        if(Object.keys(query).length === 0)
            return this.service.readById(param._id);
        else if(query.with && (typeof query.with === 'string'))
            return this.service.readOneWithCollections(param._id, query.with);
        else if(query.all !== null)
            return this.service.readOneWithAllCollections(param._id);
    }

    @AddBaseGetAllDecorators(ClassName.CLAN)
    public async getAll() {
        return this.service.readAll();
    }

    @AddBaseUpdateOneDecorators(ClassName.CLAN)
    public async update(@Body() body: UpdateClanDto){
        return this.service.updateById(body);
    }

    @AddBaseDeleteOneByIdDecorators(ClassName.CLAN)
    public async delete(@Param() param: _idDto) {
        return this.service.deleteById(param._id);
    }
}