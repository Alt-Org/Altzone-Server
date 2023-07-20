import {Body, Controller, Delete, Get, Param, Post, Put, Query} from "@nestjs/common";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {GetQueryDto} from "../common/dto/getQuery.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {UpdateCustomCharacterDto} from "./dto/updateCustomCharacter.dto";
import {CustomCharacterService} from "./customCharacter.service";
import {CreateCustomCharacterDto} from "./dto/createCustomCharacter.dto";
import {CustomCharacterDto} from "./dto/customCharacter.dto";

@Controller('customCharacter')
export class CustomCharacterController{
    public constructor(
        private readonly service: CustomCharacterService
    ) {
    }

    @Post()
    @BasicPOST(CustomCharacterDto)
    public create(@Body() body: CreateCustomCharacterDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @BasicGET(ModelName.CUSTOM_CHARACTER, CustomCharacterDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Query() query: GetQueryDto) {
        return this.service.readOneById(param._id);
    }

    @Get()
    @BasicGET(ModelName.CUSTOM_CHARACTER, CustomCharacterDto)
    public getAll() {
        return this.service.readAll();
    }

    @Put()
    @BasicPUT(ModelName.CUSTOM_CHARACTER)
    public update(@Body() body: UpdateCustomCharacterDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @BasicDELETE(ModelName.CUSTOM_CHARACTER)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}