import { Controller, Get } from "@nestjs/common";
import { ModelName } from "../common/enum/modelName.enum";
import { _idDto } from "../common/dto/_id.dto";
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { AddSearchQuery } from "../common/interceptor/request/addSearchQuery.interceptor";
import { AddSortQuery } from "../common/interceptor/request/addSortQuery.interceptor";
import { SoulHomeDto } from "./dto/soulhome.dto";
import { Authorize } from "../authorization/decorator/Authorize";
import { Action } from "../authorization/enum/action.enum";
import { SoulHomeService } from "./soulhome.service";
import { Serialize } from "../common/interceptor/response/Serialize";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { LoggedUser } from "../common/decorator/param/LoggedUser.decorator";
import { User } from "../auth/user";
import SoulHomeHelperService from "./utils/soulHomeHelper.service";
import { publicReferences } from "./soulhome.schema";
import { IncludeQuery } from "../common/decorator/param/IncludeQuery.decorator";

@Controller('soulhome')
export class SoulHomeController {
    public constructor(
        private readonly service: SoulHomeService,
        private readonly helper: SoulHomeHelperService
    ) {
    }

    @Get()
    @Authorize({action: Action.read, subject: SoulHomeDto})
    @OffsetPaginate(ModelName.SOULHOME)
    @AddSearchQuery(SoulHomeDto)
    @AddSortQuery(SoulHomeDto)
    @Serialize(SoulHomeDto)
    @UniformResponse(ModelName.SOULHOME)
    public async getPlayerSoulHome(@IncludeQuery(publicReferences) includeRefs: ModelName[], @LoggedUser() user: User) {
        const [soulHome, errors] = await this.helper.getPlayerSoulHome(user.player_id);
        if(errors || !soulHome)
            return [null, errors];

        return this.service.readOneById(soulHome._id, {includeRefs});
    }
}