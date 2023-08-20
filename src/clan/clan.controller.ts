import {ClanService} from "./clan.service";
import {Body, Controller, Delete, Get, Param, Post, Put, Query, Req} from "@nestjs/common";
import {CreateClanDto} from "./dto/createClan.dto";
import {UpdateClanDto} from "./dto/updateClan.dto";
import {ClanDto} from "./dto/clan.dto";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {GetQueryDto} from "../common/dto/getQuery.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {Authorize} from "../authorization/decorator/Authorize";
import {Action} from "../authorization/enum/action.enum";

@Controller('clan')
export class ClanController{
    public constructor(
        private readonly service: ClanService
    ) {
    }

    @Post()
    @Authorize({action: Action.create, subject: ClanDto})
    @BasicPOST(ClanDto)
    public create(@Body() body: CreateClanDto, @Req() request: Request) {
        //add clan creator to admins
        const creatorPlayer_id = request['user'].player_id;
        body['admin_ids'] = [creatorPlayer_id];

        return this.service.createOne(body);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: ClanDto})
    @BasicGET(ModelName.CLAN, ClanDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Query() query: GetQueryDto) {
        return this.service.readOneById(param._id);
    }

    @Get()
    @Authorize({action: Action.read, subject: ClanDto})
    @BasicGET(ModelName.CLAN, ClanDto)
    public getAll() {
        return this.service.readAll();
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateClanDto})
    @BasicPUT(ModelName.CLAN)
    public update(@Body() body: UpdateClanDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: UpdateClanDto})
    @BasicDELETE(ModelName.CLAN)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}