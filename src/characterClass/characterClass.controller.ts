import {Body, Controller, Delete, Get, Param, Post, Put, Query} from "@nestjs/common";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {GetQueryDto} from "../common/dto/getQuery.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {CharacterClassService} from "./characterClass.service";
import {CreateCharacterClassDto} from "./dto/createCharacterClass.dto";
import {UpdateCharacterClassDto} from "./dto/updateCharacterClass.dto";
import {CharacterClassDto} from "./dto/characterClass.dto";

@Controller('characterClass')
export class CharacterClassController{
    public constructor(
        private readonly service: CharacterClassService
    ) {
    }

    @Post()
    @BasicPOST(CharacterClassDto)
    public create(@Body() body: CreateCharacterClassDto) {
        return this.service.create(body);
    }

    @Get('/:_id')
    @BasicGET(ModelName.CHARACTER_CLASS, CharacterClassDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Query() query: GetQueryDto) {
        return this.service.readById(param._id);
    }

    @Get()
    @BasicGET(ModelName.CHARACTER_CLASS, CharacterClassDto)
    public getAll() {
        return this.service.readAll();
    }

    @Put()
    @BasicPUT(ModelName.CHARACTER_CLASS)
    public update(@Body() body: UpdateCharacterClassDto){
        return this.service.updateById(body);
    }

    @Delete('/:_id')
    @BasicDELETE(ModelName.CHARACTER_CLASS)
    public delete(@Param() param: _idDto) {
        return this.service.deleteById(param._id);
    }
}