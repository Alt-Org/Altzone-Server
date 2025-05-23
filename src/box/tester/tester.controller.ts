import { Body, Controller, Post } from '@nestjs/common';
import { TesterService } from './tester.service';
import DefineTestersDto from './dto/define.testers.dto';
import { IsGroupAdmin } from '../auth/decorator/IsGroupAdmin';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { ModelName } from '../../common/enum/modelName.enum';
import { APIError } from '../../common/controller/APIError';
import { APIErrorReason } from '../../common/controller/APIErrorReason';
import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { BoxUser } from '../auth/BoxUser';
import SwaggerTags from '../../common/swagger/tags/SwaggerTags.decorator';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';

@SwaggerTags('Box')
@Controller('/box/testers')
export class TesterController {
  constructor(private testerService: TesterService) {}

  /**
   * Define testers amount
   *
   * @remarks Endpoint for adjusting amount of testers in the box. Notice that only box admin can do it
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 403, 404],
  })
  @Post()
  @IsGroupAdmin()
  @UniformResponse(ModelName.BOX)
  async defineTestersAmount(
    @Body() body: DefineTestersDto,
    @LoggedUser() user: BoxUser,
  ) {
    if (!body.amountToAdd && !body.amountToRemove)
      return [
        null,
        [
          new APIError({
            reason: APIErrorReason.REQUIRED,
            message: 'One of the amount is required to be set',
          }),
        ],
      ];

    if (body.amountToAdd) {
      const [createdTesters, creationErrors] =
        await this.testerService.createTesters(body.amountToAdd);
      if (creationErrors) return [null, creationErrors];

      const [, boxAdditionErrors] = await this.testerService.addTestersToBox(
        user.box_id,
        createdTesters,
      );
      if (boxAdditionErrors) return [null, boxAdditionErrors];

      const [, clanAdditionErrors] = await this.testerService.addTestersToClans(
        user.box_id,
        createdTesters,
      );
      if (clanAdditionErrors) return [null, boxAdditionErrors];
    }

    if (body.amountToRemove) {
      const [, removalErrors] = await this.testerService.deleteTesters(
        user.box_id,
        body.amountToRemove,
      );
      if (removalErrors) return [null, removalErrors];
    }
  }
}
