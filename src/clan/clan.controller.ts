import {ClanService} from "./clan.service";
import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {ClassName} from "../util/dictionary";
import {Body, Controller, Delete, Get, Param, Post, Put, Query} from "@nestjs/common";

@Controller('clan')
export class ClanController{
    public constructor(private readonly service: ClanService) {
        this.errorThrower = new DefaultResponseErrorThrower(ClassName.CLAN);
    }

    private readonly errorThrower: DefaultResponseErrorThrower;

    @Post()
    public create (@Body() body: any) {
        return this.service.create(body);
    }
    @Get('/:_id')
    public async get (@Param('_id') _id: string, @Query() query: any) {
        if(Object.keys(query).length === 0)
            return  this.service.readById(_id);
        /*
        else if(query.with && (typeof query.with == 'string'))
            respObj = await this.service.readOneWithCollections(req.params._id, query.with);
        else if(query.all !== null)
            respObj = await this.service.readOneAllCollections(req.params._id);*/
    }

    @Get()
    public async getAll () {
        return this.service.readAll();
    }

    @Put()
    public async update (@Body() body: any){
        return this.service.updateById(body);
    }

    @Delete('/:_id')
    public async delete (@Param('_id') _id: string) {
        return this.service.deleteById(_id);
    }
}