import {Body, Controller, Get, Param, Post, Put} from "@nestjs/common";
import {_idDto} from "../../common/dto/_id.dto";
import {ModelName} from "../../common/enum/modelName.enum";
import {UpdateCustomCharacterDto} from "./dto/updateCustomCharacter.dto";
import {CustomCharacterService} from "./customCharacter.service";
import {CreateCustomCharacterDto} from "./dto/createCustomCharacter.dto";
import {CustomCharacterDto} from "./dto/customCharacter.dto";
import {Authorize} from "../../authorization/decorator/Authorize";
import {Action} from "../../authorization/enum/action.enum";
import {AddSearchQuery} from "../../common/interceptor/request/addSearchQuery.interceptor";
import {GetAllQuery} from "../../common/decorator/param/GetAllQuery";
import {IGetAllQuery} from "../../common/interface/IGetAllQuery";
import { OffsetPaginate } from "../../common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "../../common/interceptor/request/addSortQuery.interceptor";
import {LoggedUser} from "../../common/decorator/param/LoggedUser.decorator";
import {User} from "../../auth/user";
import {UniformResponse} from "../../common/decorator/response/UniformResponse";
import {Serialize} from "../../common/interceptor/response/Serialize";
import {IncludeQuery} from "../../common/decorator/param/IncludeQuery.decorator";
import {publicReferences} from "./customCharacter.schema";

@Controller('customCharacter')
export class CustomCharacterController{
    public constructor(private readonly service: CustomCharacterService) {
    }

    @Post()
    @Authorize({action: Action.create, subject: CustomCharacterDto})
    @Serialize(CustomCharacterDto)
    @UniformResponse(ModelName.CUSTOM_CHARACTER)
    public create(@Body() body: CreateCustomCharacterDto, @LoggedUser() user: User) {
        return this.service.createOne(body, user.player_id);
    }

    @Get('/battleCharacters')
    @Authorize({action: Action.read, subject: CustomCharacterDto})
    @Serialize(CustomCharacterDto)
    @UniformResponse(ModelName.CUSTOM_CHARACTER)
    public async getBattleCharacters(@LoggedUser() user: User) {
        return this.service.readPlayerBattleCharacters(user.player_id);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: CustomCharacterDto})
    @Serialize(CustomCharacterDto)
    @UniformResponse(ModelName.CUSTOM_CHARACTER)
    public async get(@Param() param: _idDto, @IncludeQuery(publicReferences) includeRefs: ModelName[], @LoggedUser() user: User) {
        return this.service.readOne({ includeRefs, filter: { _id: param._id, player_id: user.player_id } });
    }

    @Get()
    @Authorize({action: Action.read, subject: CustomCharacterDto})
    @OffsetPaginate(ModelName.CUSTOM_CHARACTER)
    @AddSearchQuery(CustomCharacterDto)
    @AddSortQuery(CustomCharacterDto)
    @Serialize(CustomCharacterDto)
    @UniformResponse(ModelName.CUSTOM_CHARACTER)
    public async getAll(@GetAllQuery() query: IGetAllQuery, @LoggedUser() user: User) {
        return this.service.readMany({...query, filter: {...query.filter, player_id: user.player_id}});
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateCustomCharacterDto})
    @UniformResponse(ModelName.CUSTOM_CHARACTER)
    public async update(@Body() body: UpdateCustomCharacterDto, @LoggedUser() user: User){
        const [resp, errors] = await this.service.updateOneByCondition(body, { filter: { player_id:  user.player_id } });
        if(errors)
            return [null, errors];
    }
}