import DefaultResponseErrorThrower from "../util/response/defaultResponseErrorThrower";
import {ClassName} from "../util/dictionary";
import {Body, Controller, Delete, Get, Param, Post, Put, Query} from "@nestjs/common";
import {PlayerService} from "./player.service";
import {CreatePlayerDto} from "./dto/createPlayer.dto";
import {UpdatePlayerDto} from "./dto/updatePlayer.dto";
import {CatchCreateUpdateErrors} from "../decorator/CatchCreateUpdateErrors";

@Controller('player')
export default class PlayerController{
    public constructor(private readonly service: PlayerService) {
        this.errorThrower = new DefaultResponseErrorThrower(ClassName.PLAYER);
    }

    private readonly errorThrower: DefaultResponseErrorThrower;

    @Post()
    @CatchCreateUpdateErrors()
    public create(@Body() body: CreatePlayerDto) {
        return this.service.create(body);
    }

    @Get('/:_id')
    public async get(@Param('_id') _id: string, @Query() query: any) {
        if(Object.keys(query).length === 0)
            return  this.service.readById(_id);
        /*
        else if(query.with && (typeof query.with == 'string'))
            respObj = await this.service.readOneWithCollections(req.params._id, query.with);
        else if(query.all !== null)
            respObj = await this.service.readOneAllCollections(req.params._id);*/
    }

    @Get()
    public async getAll() {
        return this.service.readAll();
    }

    @Put()
    public async update(@Body() body: UpdatePlayerDto){
        return this.service.updateById(body);
    }

    @Delete('/:_id')
    public async delete(@Param('_id') _id: string) {
        return this.service.deleteById(_id);
    }
}