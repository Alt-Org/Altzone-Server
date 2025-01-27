import {Body, Controller, Get, Param, Post, Put, Req} from "@nestjs/common";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {UpdateCustomCharacterDto} from "./dto/updateCustomCharacter.dto";
import {CustomCharacterService} from "./customCharacter.service";
import {CreateCustomCharacterDto} from "./dto/createCustomCharacter.dto";
import {CustomCharacterDto} from "./dto/customCharacter.dto";
import {Authorize} from "../authorization/decorator/Authorize";
import {Action} from "../authorization/enum/action.enum";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {AddSearchQuery} from "../common/interceptor/request/addSearchQuery.interceptor";
import {GetAllQuery} from "../common/decorator/param/GetAllQuery";
import {IGetAllQuery} from "../common/interface/IGetAllQuery";
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "../common/interceptor/request/addSortQuery.interceptor";

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
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @Get()
    @Authorize({action: Action.read, subject: CustomCharacterDto})
    @OffsetPaginate(ModelName.CUSTOM_CHARACTER)
    @AddSearchQuery(CustomCharacterDto)
    @AddSortQuery(CustomCharacterDto)
    @BasicGET(ModelName.CUSTOM_CHARACTER, CustomCharacterDto)
    public async getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateCustomCharacterDto})
    @BasicPUT(ModelName.CUSTOM_CHARACTER)
    public update(@Body() body: UpdateCustomCharacterDto){
        return this.service.updateOneById(body);
    }
}