import { Controller, Get } from '@nestjs/common';
import { SoulHomeDto } from './dto/soulhome.dto';
import { SoulHomeService } from './soulhome.service';
import SoulHomeHelperService from './utils/soulHomeHelper.service';
import { publicReferences } from './soulhome.schema';
import { User } from '../../auth/user';
import { Authorize } from '../../authorization/decorator/Authorize';
import { Action } from '../../authorization/enum/action.enum';
import { IncludeQuery } from '../../common/decorator/param/IncludeQuery.decorator';
import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { ModelName } from '../../common/enum/modelName.enum';
import { AddSearchQuery } from '../../common/interceptor/request/addSearchQuery.interceptor';
import { AddSortQuery } from '../../common/interceptor/request/addSortQuery.interceptor';
import { OffsetPaginate } from '../../common/interceptor/request/offsetPagination.interceptor';

@Controller('soulhome')
export class SoulHomeController {
  public constructor(
    private readonly service: SoulHomeService,
    private readonly helper: SoulHomeHelperService,
  ) {}

  @Get()
  @Authorize({ action: Action.read, subject: SoulHomeDto })
  @OffsetPaginate(ModelName.SOULHOME)
  @AddSearchQuery(SoulHomeDto)
  @AddSortQuery(SoulHomeDto)
  @UniformResponse(ModelName.SOULHOME, SoulHomeDto)
  public async getPlayerSoulHome(
    @IncludeQuery(publicReferences) includeRefs: ModelName[],
    @LoggedUser() user: User,
  ) {
    const [soulHome, errors] = await this.helper.getPlayerSoulHome(
      user.player_id,
    );
    if (errors || !soulHome) return [null, errors];

    return this.service.readOneById(soulHome._id, { includeRefs });
  }
}
