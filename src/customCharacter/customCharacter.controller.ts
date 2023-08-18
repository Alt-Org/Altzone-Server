import {Body, Controller, Delete, Get, Param, Post, Put, Query, Req} from "@nestjs/common";
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
import {Authorize} from "../authorization/decorator/Authorize";
import {Action} from "../authorization/enum/action.enum";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";

@Controller('customCharacter')
export class CustomCharacterController{
    public constructor(private readonly service: CustomCharacterService) {
    }

    @Post()
    @Authorize({action: Action.create, subject: CustomCharacterDto})
    @BasicPOST(CreateCustomCharacterDto)
    public create(@Body() body: CreateCustomCharacterDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: CustomCharacterDto})
    @BasicGET(ModelName.CUSTOM_CHARACTER, CustomCharacterDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Query() query: GetQueryDto) {
        return this.service.readOneById(param._id);
    }

    @Get()
    @Authorize({action: Action.read, subject: CustomCharacterDto})
    @BasicGET(ModelName.CUSTOM_CHARACTER, CustomCharacterDto)
    public async getAll(@Req() request: Request) {
        return this.service.readAll(request['allowedFields']);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateCustomCharacterDto})
    @BasicPUT(ModelName.CUSTOM_CHARACTER)
    public update(@Body() body: UpdateCustomCharacterDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: UpdateCustomCharacterDto})
    @BasicDELETE(ModelName.CUSTOM_CHARACTER)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}