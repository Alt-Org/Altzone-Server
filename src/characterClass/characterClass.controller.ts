import {Body, Controller, Delete, Get, Param, Post, Put, Req} from "@nestjs/common";
import {_idDto} from "../common/dto/_id.dto";
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
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "../common/interceptor/request/addSortQuery.interceptor";
import { NoAuth } from "../auth/decorator/NoAuth.decorator";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { Serialize } from "../common/interceptor/response/Serialize";
import { isServiceError } from "../common/service/basicService/ServiceError";
import { IncludeQuery } from "../common/decorator/param/IncludeQuery.decorator";
import { publicReferences } from "./characterClass.schema";
import { LoggedUser } from "../common/decorator/param/LoggedUser.decorator";
import { User } from "../auth/user";

//The endpoint to use. Controller classes will be registered for this endpoint automatically (/characterClass)
@Controller('characterClass')
export class CharacterClassController{
    //service is automatically injected by Nest
    public constructor(private readonly service: CharacterClassService) {
    }

    //Http method to use
    @Post()
    //If there is any permission rules specify them with this decorator. 
    //You can check the /src/authorization/rule/characterClassRules.ts for example of how to setup the authorization rules
    @Authorize({action: Action.create, subject: CharacterClassDto})
    //Use this decorator everywhere. It will handle all work with sending responses to client as well as catch APIErrors and ServiceErrors
    @UniformResponse(ModelName.CHARACTER_CLASS)
    //This is a controller class method, which should return some value.
    //Unlike in express here is no need to handle sending data to client side manually. 
    //Nest and the @UniformResponse() decorator make it automatically
    //This method should return a value, which should be returned in case of success
    //In case of error an APIError object should be returned or thrown
    public async create(@Body() body: CreateCharacterClassDto) {
        return this.service.createOne(body);
    }

    //Notice that you can also add sub-endpoints and endpoints with params like in express
    @Get('/:_id')
    //You can also open the endpoint for everyone, so there is no need to provide authentication (the Authorization header with token)
    //Notice that in that case you can not use @Authorize() and you have no user object 
    @NoAuth()
    @UniformResponse(ModelName.CHARACTER_CLASS)
    //Notice that the params can also be validated
    public get(@Param() param: _idDto, @IncludeQuery(publicReferences) includeRefs: ModelName[]) {
        return this.service.readOneById(param._id, { includeRefs });
    }

    @Get()
    @Authorize({action: Action.read, subject: CharacterClassDto})
    //Add pagination = queries "limit", "page" and "withPageCount"
    @OffsetPaginate(ModelName.CHARACTER_CLASS)
    //Add "search" query
    @AddSearchQuery(CharacterClassDto)
    //Add "sort" query
    @AddSortQuery(CharacterClassDto)
    //Add Serialization
    @Serialize(CharacterClassDto)
    @UniformResponse(ModelName.CHARACTER_CLASS)
    //Get all above data (pagination, sorting and search) via @GetAllQuery()
    public async getAll(@GetAllQuery() query: IGetAllQuery) {
       return this.service.readAll(query);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateCharacterClassDto})
    @UniformResponse()
    public async update(@Body() body: UpdateCharacterClassDto){
        //Usually you do not want to return anything for put and delete if it was success (204 response)
        const resp = await this.service.updateOneById(body);
        if(isServiceError(resp))
            return resp;
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: UpdateCharacterClassDto})
    @UniformResponse()
    //You can get a logged-in user with LoggedUser decorator
    public async delete(@Param() param: _idDto, @LoggedUser() user: User) {
        const resp = await this.service.deleteOneById(param._id);
        if(isServiceError(resp))
            return resp;
    }
}