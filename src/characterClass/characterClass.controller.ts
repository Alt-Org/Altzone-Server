import {Body, Controller, Delete, Get, Param, Post, Put, Query, Req} from "@nestjs/common";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {CharacterClassService} from "./characterClass.service";
import {CreateCharacterClassDto} from "./dto/createCharacterClass.dto";
import {UpdateCharacterClassDto} from "./dto/updateCharacterClass.dto";
import {CharacterClassDto} from "./dto/characterClass.dto";
import {Authorize} from "../authorization/decorator/Authorize";
import {Action} from "../authorization/enum/action.enum";
import {AddSearchQuery} from "../common/interceptor/request/addSearchQuery.interceptor";
import {GetAllQuery} from "../common/decorator/param/GetAllQuery";
import {IGetAllQuery} from "../common/interface/IGetAllQuery";
import { OffsetPaginate } from "src/common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "src/common/interceptor/request/addSortQuery.interceptor";

@Controller('characterClass')
export class CharacterClassController{
    public constructor(private readonly service: CharacterClassService) {
    }

    @Post()
    @Authorize({action: Action.create, subject: CharacterClassDto})
    @BasicPOST(CharacterClassDto)
    public create(@Body() body: CreateCharacterClassDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: CharacterClassDto})
    @BasicGET(ModelName.CHARACTER_CLASS, CharacterClassDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @Get()
    @Authorize({action: Action.read, subject: CharacterClassDto})
    @OffsetPaginate(ModelName.CHARACTER_CLASS)
    @AddSearchQuery(CharacterClassDto)
    @AddSortQuery(CharacterClassDto)
    @BasicGET(ModelName.CHARACTER_CLASS, CharacterClassDto)
    public getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateCharacterClassDto})
    @BasicPUT(ModelName.CHARACTER_CLASS)
    public update(@Body() body: UpdateCharacterClassDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: UpdateCharacterClassDto})
    @BasicDELETE(ModelName.CHARACTER_CLASS)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}