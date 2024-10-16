import {Body, Controller, Delete, Get, Param, Post, Put, Req} from "@nestjs/common";
import {ProfileService} from "./profile.service";
import {CreateProfileDto} from "./dto/createProfile.dto";
import {UpdateProfileDto} from "./dto/updateProfile.dto";
import {ProfileDto} from "./dto/profile.dto";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
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
import {AddSearchQuery} from "../common/interceptor/request/addSearchQuery.interceptor";
import {GetAllQuery} from "../common/decorator/param/GetAllQuery";
import {IGetAllQuery} from "../common/interface/IGetAllQuery";
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "../common/interceptor/request/addSortQuery.interceptor";

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

        const profileResp = await this.service.createOne(profile);
        if(profileResp && !(profileResp instanceof MongooseError)){
            
            const profileDataKey = profileResp.metaData.dataKey;
            Player['profile_id'] = profileResp.data[profileDataKey]._id;
            try{
                const playerResp = await this.playerService.createOne(Player);
                if(playerResp && !(playerResp instanceof MongooseError))
                    profileResp.data[profileDataKey].Player = playerResp.data[playerResp.metaData.dataKey];
            } catch(e){
                await this.service.deleteOneById(profileResp.data[profileResp.metaData.dataKey]._id);
                throw e;
            }
        }

        return profileResp;
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: ProfileDto})
    @BasicGET(ModelName.PROFILE, ProfileDto)
    @AddGetQueries()
    public async get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @Get()
    @Authorize({action: Action.read, subject: ProfileDto})
    @OffsetPaginate(ModelName.PROFILE)
    @AddSearchQuery(ProfileDto)
    @AddSortQuery(ProfileDto)
    @BasicGET(ModelName.PROFILE, ProfileDto)
    public async getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateProfileDto})
    @BasicPUT(ModelName.PROFILE)
    public async update(@Body() body: UpdateProfileDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: ProfileDto})
    @CheckPermissions()
    @BasicDELETE(ModelName.PROFILE)
    public async delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}