import {Body, Controller, Delete, Get, Param, Post, Put, Query, Req} from "@nestjs/common";
import {ProfileService} from "./profile.service";
import {CreateProfileDto} from "./dto/createProfile.dto";
import {UpdateProfileDto} from "./dto/updateProfile.dto";
import {ProfileDto} from "./dto/profile.dto";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {GetQueryDto} from "../common/dto/getQuery.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {NoAuth} from "../auth/decorator/NoAuth.decorator";
import {Action} from "../authorization/enum/action.enum";
import {CheckPermissions} from "../authorization/authorization.interceptor";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {CatchCreateUpdateErrors} from "../common/decorator/response/CatchCreateUpdateErrors";
import {Serialize} from "../common/interceptor/response/Serialize";
import {Authorize} from "../authorization/decorator/Authorize";
import {_idDto} from "../common/dto/_id.dto";
import {MongooseError} from "mongoose";
import {PlayerService} from "../player/player.service";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {AddSearchQueryDecorator} from "../common/decorator/request/AddSearchQuery.decorator";

@Controller('profile')
export default class ProfileController {
    public constructor(
        private readonly service: ProfileService,
        private readonly playerService: PlayerService,
        private readonly requestHelperService: RequestHelperService
    ) {
    }

    @NoAuth()
    @Post()
    @Serialize(ProfileDto)
    @CatchCreateUpdateErrors()
    public async create(@Body() body: CreateProfileDto) {
        const {Player, ...profile} = body;

        if(!Player)
            return this.service.createOne(profile);

        const profileResp: any = await this.service.createOne(profile);
        if(profileResp && !(profileResp instanceof MongooseError)){
            Player['profile_id'] = profileResp._id;
            try{
                profileResp['Player'] = await this.playerService.createOne(Player);
            } catch(e){
                await this.service.deleteOneById(profileResp._id);
                throw e;
            }
        }

        return profileResp;
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: ProfileDto})
    @BasicGET(ModelName.PROFILE, ProfileDto)
    @AddGetQueries()
    public async get(@Param() param: _idDto, @Query() query: GetQueryDto) {
        return this.service.readOneById(param._id);
    }

    @Get()
    @Authorize({action: Action.read, subject: ProfileDto})
    @AddSearchQueryDecorator(ProfileDto)
    @BasicGET(ModelName.PROFILE, ProfileDto)
    public async getAll(@Req() request: Request) {
        return this.service.readAll(request['allowedFields'], request['mongoFilter']);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateProfileDto})
    @BasicPUT(ModelName.PROFILE)
    public async update(@Body() body: UpdateProfileDto){
        return this.service.updateOneByCondition({username: body.username}, body);
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: ProfileDto})
    @CheckPermissions()
    @BasicDELETE(ModelName.PROFILE)
    public async delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}