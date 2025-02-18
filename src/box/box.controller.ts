import {Body, Controller, Delete, Get, Param, Post} from "@nestjs/common";
import {BoxService} from "./box.service";
import {Serialize} from "../common/interceptor/response/Serialize";
import {UniformResponse} from "../common/decorator/response/UniformResponse";
import {ModelName} from "../common/enum/modelName.enum";
import {CreatedBoxDto} from "./dto/createdBox.dto";
import {NoAuth} from "../auth/decorator/NoAuth.decorator";
import BoxCreator from "./boxCreator";
import {CreateBoxDto} from "./dto/createBox.dto";
import BoxAuthHandler from "./auth/BoxAuthHandler";
import {_idDto} from "../common/dto/_id.dto";
import {IncludeQuery} from "../common/decorator/param/IncludeQuery.decorator";
import {publicReferences} from "./schemas/box.schema";

@Controller('box')
export class BoxController {
    public constructor(
        private readonly service: BoxService,
        private readonly boxCreator: BoxCreator,
        private readonly authHandler: BoxAuthHandler
    ) {
    }

    @NoAuth()
    @Post()
    @Serialize(CreatedBoxDto)
    @UniformResponse(ModelName.BOX)
    async createBox(@Body() body: CreateBoxDto) {
        const [createdBox, errors] = await this.boxCreator.createBox(body);
        if (errors)
            return [null, errors];

        const groupAdminAccessToken = await this.authHandler.getGroupAdminToken({
            box_id: createdBox._id.toString(),
            player_id: createdBox.adminPlayer_id.toString(),
            profile_id: createdBox.adminProfile_id.toString()
        });

        return [{...createdBox, accessToken: groupAdminAccessToken}, null];
    }

    //For time of development only
    @NoAuth()
    @Get('/:_id')
    @NoAuth()
    @UniformResponse(ModelName.CLAN)
    public getOne(@Param() param: _idDto, @IncludeQuery(publicReferences as any) includeRefs: ModelName[]) {
        return this.service.readOneById(param._id, { includeRefs });
    }

    //For time of development only
    @NoAuth()
    @Delete('/:_id')
    @UniformResponse(ModelName.BOX)
    async deleteBox(@Param() _id: string) {
        const [isSuccess, errors] = await this.service.deleteOneById(_id);

        if (errors)
            return [null, errors];
    }
}
