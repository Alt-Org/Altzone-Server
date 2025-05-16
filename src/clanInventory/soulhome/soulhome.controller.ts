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
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';

@Controller('soulhome')
export class SoulHomeController {
  public constructor(
    private readonly service: SoulHomeService,
    private readonly helper: SoulHomeHelperService,
  ) {}

  /**
   * Get soul home of the logged-in player
   *
   * @remarks Get SoulHome data for the logged-in user.
   *
   * If the logged-in user is a Clan member, the SoulHome for this Clan will be returned.
   *
   * If the logged-in user is not belonging to any Clan the 404 error will be returned.
   */
  @ApiResponseDescription({
    success: {
      dto: SoulHomeDto,
      modelName: ModelName.SOULHOME,
    },
    errors: [401, 404],
  })
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
