import {ClanService} from "./clan.service";
import {ClassName} from "../util/dictionary";
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query
} from "@nestjs/common";
import {CreateClanDto} from "./dto/createClan.dto";
import {UpdateClanDto} from "./dto/updateClan.dto";
import {BasicPOST} from "../base/decorator/BasicPOST.decorator";
import {BasicGET} from "../base/decorator/BasicGET.decorator";
import {BasicPUT} from "../base/decorator/BasicPUT.decorator";
import {BasicDELETE} from "../base/decorator/BasicDELETE.decorator";
import {AddGetQueries} from "../requestHelper/decorator/AddGetQueries.decorator";
import {_idDto} from "../requestHelper/dto/_id.dto";
import {GetQueryDto} from "../requestHelper/dto/getQuery.dto";
import {Serialize} from "../decorator/Serialize";
import {serializationArray} from "./dto/serializationArray";

//TODO: serialization to interceptor

@Controller('clan')
export class ClanController{
    public constructor(
        private readonly service: ClanService
    ) {
    }

    @Post()
    @Serialize(serializationArray)
    @BasicPOST()
    public create(@Body() body: CreateClanDto) {
        return this.service.create(body);
    }

    @Get('/:_id')
    @Serialize(serializationArray)
    @AddGetQueries()
    @BasicGET(ClassName.CLAN)
    public get(@Param() param: _idDto, @Query() query: GetQueryDto) {
        return this.service.readById(param._id);
    }

    @Get()
    @Serialize(serializationArray)
    @BasicGET(ClassName.CLAN)
    public getAll() {
        return this.service.readAll();
    }

    @Put()
    @BasicPUT(ClassName.CLAN)
    public update(@Body() body: UpdateClanDto){
        return this.service.updateById(body);
    }

    @Delete('/:_id')
    @BasicDELETE(ClassName.CLAN)
    public delete(@Param() param: _idDto) {
        return this.service.deleteById(param._id);
    }
}