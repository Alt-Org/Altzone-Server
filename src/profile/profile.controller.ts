import {Body, Controller, Delete, Get, Param, Post, Put, Query, Req} from "@nestjs/common";
import {ProfileService} from "./profile.service";
import {CreateProfileDto} from "./dto/createProfile.dto";
import {UpdateProfileDto} from "./dto/updateProfile.dto";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {ProfileDto} from "./dto/profile.dto";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {GetQueryDto} from "../common/dto/getQuery.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {UsernameDto} from "./dto/username.dto";
import {NoAuth} from "../auth/decorator/NoAuth.decorator";
import {Action} from "../authorization/enum/action.enum";
import {Authorize} from "../authorization/authorization.interceptor";
import {SetAuthorizationFor} from "../authorization/decorator/SetAuthorizationFor";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {CatchCreateUpdateErrors} from "../common/decorator/response/CatchCreateUpdateErrors";
import {Serialize} from "../common/interceptor/response/Serialize";

@Controller('profile')
export default class ProfileController {
    public constructor(private readonly service: ProfileService) {
    }

    @NoAuth()
    @Post()
    @CatchCreateUpdateErrors()
    @Serialize(ProfileDto)
    public create(@Body() body: CreateProfileDto) {
        return this.service.createOne(body);
    }

    @Get('/:username')
    @SetAuthorizationFor({action: Action.read, subject: ProfileDto})
    @Authorize()
    @BasicGET(ModelName.PROFILE, ProfileDto)
    @AddGetQueries('username')
    public async get(@Param() param: UsernameDto, @Query() query: GetQueryDto) {
        return this.service.readOneByCondition({username: param.username});
    }

    @Get()
    @SetAuthorizationFor({action: Action.read, subject: ProfileDto})
    @Authorize()
    @BasicGET(ModelName.PROFILE, ProfileDto)
    public async getAll(@Req() request: Request) {
        return this.service.readAll(request['allowedFields']);
    }

    @Put()
    @SetAuthorizationFor({action: Action.update, subject: UpdateProfileDto})
    @Authorize()
    @BasicPUT(ModelName.PROFILE)
    public async update(@Body() body: UpdateProfileDto){
        return this.service.updateOneByCondition({username: body.username}, body);
    }

    @Delete('/:username')
    @SetAuthorizationFor({action: Action.delete, subject: ProfileDto})
    @Authorize()
    @BasicDELETE(ModelName.PROFILE)
    public async delete(@Param() param: UsernameDto) {
        return this.service.deleteOneByCondition({username: param.username});
    }
}