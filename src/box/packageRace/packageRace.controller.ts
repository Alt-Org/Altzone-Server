import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BoxTestingSessionGuard } from '../auth/boxTestingSession.guard';
import SwaggerTags from '../../common/swagger/tags/SwaggerTags.decorator';
import { PackageRaceService } from './packageRace.service';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';
import { PackageRaceDto } from './dto/packageRace.dto';
import { ModelName } from '../../common/enum/modelName.enum';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { BoxUser } from '../auth/BoxUser';
import { IsGroupAdmin } from '../auth/decorator/IsGroupAdmin';

@SwaggerTags('Box')
@Controller('/box/package-race')
@UseGuards(BoxTestingSessionGuard)
export class PackageRaceController {
  constructor(private readonly service: PackageRaceService) {}

  /**
   * Get package race of the box
   *
   * @remarks Get the package race between the two teams of the logged-in user's box session.
   *
   * While the package race's status is "ACTIVE", team points are live.
   * when the status is "ENDED", the results are frozen.
   */
  @ApiResponseDescription({
    success: {
      dto: PackageRaceDto,
      modelName: ModelName.BOX,
    },
    errors: [401, 403, 404],
  })
  @Get()
  @UniformResponse(ModelName.BOX, PackageRaceDto)
  async getPackageRace(@LoggedUser() user: BoxUser) {
    return this.service.getPackageRace(user.box_id);
  }

  /**
   * End package race of the box
   *
   * @remarks End the active package race of the logged-in user's box session and freeze the team results.
   *
   * Notice that only the group admin can end the package race.
   */
  @ApiResponseDescription({
    success: {
      status: 201,
      dto: PackageRaceDto,
      modelName: ModelName.BOX,
    },
    errors: [401, 403, 404],
  })
  @Post('/end')
  @IsGroupAdmin()
  @UniformResponse(ModelName.BOX, PackageRaceDto)
  async endPackageRace(@LoggedUser() user: BoxUser) {
    return this.service.endPackageRace(user.box_id);
  }
}
