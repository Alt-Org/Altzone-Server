import {Controller, Get, Param} from "@nestjs/common";
import {ClanMetaService} from "./clanMeta.service";
import {Action} from "../../authorization/enum/action.enum";
import {Authorize} from "../../authorization/decorator/Authorize";
import {ClanMetaDto} from "./dto/clanMeta.dto";
import {BasicGET} from "../../common/base/decorator/BasicGET.decorator";
import {ModelName} from "../../common/enum/modelName.enum";
import {_idDto} from "../../common/dto/_id.dto";


@Controller('metaData/clan')
export class ClanMetaController{
    public constructor(
        private readonly service: ClanMetaService
    ) {
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: ClanMetaDto})
    @BasicGET(ModelName.CLAN_META, ClanMetaDto)
    public get(@Param() param: _idDto) {
        return this.service.readMetaData(param._id);
    }
}