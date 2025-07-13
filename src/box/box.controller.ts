import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BoxService } from './box.service';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import BoxCreator from './boxCreator';
import BoxAuthHandler from './auth/BoxAuthHandler';
import { CreatedBoxDto } from './dto/createdBox.dto';
import { ModelName } from '../common/enum/modelName.enum';
import { CreateBoxDto } from './dto/createBox.dto';
import { IncludeQuery } from '../common/decorator/param/IncludeQuery.decorator';
import { _idDto } from '../common/dto/_id.dto';
import { publicReferences } from './schemas/box.schema';
import { IsGroupAdmin } from './auth/decorator/IsGroupAdmin';
import { BoxUser } from './auth/BoxUser';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { BoxAuthGuard } from './auth/boxAuth.guard';
import SessionStarterService from './sessionStarter/sessionStarter.service';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { BoxDto } from './dto/box.dto';
import SwaggerTags from '../common/swagger/tags/SwaggerTags.decorator';
import { ConfigureBoxDto } from './dto/configureBox.dto';
import { ObjectId } from 'mongodb';

@Controller('box')
@UseGuards(BoxAuthGuard)
export class BoxController {
  public constructor(
    private readonly service: BoxService,
    private readonly boxCreator: BoxCreator,
    private readonly authHandler: BoxAuthHandler,
    private readonly sessionStarter: SessionStarterService,
  ) {}

  /**
   * Create a testing box.
   *
   * @remarks Create a testing box.
   *
   * Notice that in order to create the testing box a group admin password need to be obtained from backend team
   */
  @ApiResponseDescription({
    success: {
      status: 201,
      dto: CreatedBoxDto,
      modelName: ModelName.BOX,
    },
    errors: [400, 404],
    hasAuth: false,
  })
  @SwaggerTags('Release on 13.07.2025', 'Box')
  @NoAuth()
  @Post()
  @UniformResponse(ModelName.BOX, CreatedBoxDto)
  async createBox(@Body() body: CreateBoxDto) {
    const [createdBox, errors] = await this.boxCreator.createBox(body);
    if (errors) return [null, errors];

    const groupAdminAccessToken = await this.authHandler.getGroupAdminToken({
      box_id: createdBox._id.toString(),
      player_id: createdBox.adminPlayer_id.toString(),
      profile_id: createdBox.adminProfile_id.toString(),
    });

    return [{ ...createdBox, accessToken: groupAdminAccessToken }, null];
  }

  /**
   * Update box configuration.
   *
   * @remarks Update box configuration.
   */
  @SwaggerTags('Release on 13.07.2025', 'Box')
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 404],
    hasAuth: true,
  })
  @IsGroupAdmin()
  @UniformResponse()
  @Patch()
  async configureBox(
    @Body() body: ConfigureBoxDto,
    @LoggedUser() user: BoxUser,
  ) {
    const [_, err] = await this.service.updateOneById({
      _id: new ObjectId(user.box_id),
      ...body,
    });
    if (err) return [null, err];
  }

  /**
   * Reset testing box.
   *
   * @remarks Reset testing box data, which means removing all the data created during the testing session and returning the box state to the PREPARING stage.
   * For more information refer to the testing box documentation.
   *
   * Notice that only box admin can do the action.
   */
  @ApiResponseDescription({
    success: {
      dto: CreatedBoxDto,
      modelName: ModelName.BOX,
    },
    errors: [401, 403, 404],
  })
  @Put('reset')
  @UniformResponse(ModelName.BOX)
  @IsGroupAdmin()
  async resetTestingSession(@LoggedUser() user: BoxUser) {
    const boxToCreate = await this.service.getBoxResetData(user.box_id);
    const [_, deleteError] = await this.service.deleteOneById(user.box_id);
    if (deleteError) return deleteError;

    const [createdBox, createError] =
      await this.boxCreator.createBox(boxToCreate);
    if (createError) return createError;

    const groupAdminAccessToken = await this.authHandler.getGroupAdminToken({
      box_id: createdBox._id.toString(),
      player_id: createdBox.adminPlayer_id.toString(),
      profile_id: createdBox.adminProfile_id.toString(),
    });

    return [{ ...createdBox, accessToken: groupAdminAccessToken }, null];
  }

  /**
   * Delete box data.
   *
   * @remarks Delete box data associated with the logged-in user.
   *
   * Notice that the box can be removed only by the box admin.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 404],
  })
  @Delete()
  @IsGroupAdmin()
  @UniformResponse()
  async deleteBoxAndAdmin(@LoggedUser() user: BoxUser) {
    return await this.service.deleteBox(user.box_id);
  }

  /**
   * Start testing session
   *
   * @remarks Endpoint for starting testing session.
   *
   * Notice that only box admin can start a testing session.
   *
   * Notice that the minimum box data should be initialized at the moment of starting of testing session. That data is at least 2 tester accounts added.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [401, 403, 404],
  })
  @Post('/start')
  @UniformResponse(ModelName.BOX)
  @IsGroupAdmin()
  async startTestingSession(@LoggedUser() user: BoxUser) {
    const [, errors] = await this.sessionStarter.start(user.box_id);
    if (errors) return [null, errors];
  }

  /**
   * Get box by _id, For time of development only
   *
   * @remarks Endpoint for getting box data by its _id
   */
  @ApiResponseDescription({
    success: {
      dto: BoxDto,
      modelName: ModelName.BOX,
    },
    errors: [404],
    hasAuth: false,
  })
  //For time of development only
  @NoAuth()
  @Get('/:_id')
  @NoAuth()
  @UniformResponse(ModelName.BOX)
  public getOne(
    @Param() param: _idDto,
    @IncludeQuery(publicReferences as any) includeRefs: ModelName[],
  ) {
    return this.service.readOneById(param._id, { includeRefs });
  }

  /**
   * Get all boxes by. For time of development only
   *
   * @remarks Endpoint for getting box data by its _id
   */
  @ApiResponseDescription({
    success: {
      dto: BoxDto,
      modelName: ModelName.BOX,
      returnsArray: true,
    },
    errors: [404],
    hasAuth: false,
  })
  @SwaggerTags('Release on 13.07.2025', 'Box')
  //For time of development only
  @NoAuth()
  @Get('/')
  @NoAuth()
  @UniformResponse(ModelName.BOX)
  public getAll() {
    return this.service.readAll();
  }

  /**
   * Delete box by _id
   *
   * @remarks Endpoint for deleting a box by _id
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [404],
    hasAuth: false,
  })
  //For time of development only
  @NoAuth()
  @Delete('/:_id')
  @UniformResponse(ModelName.BOX)
  async deleteBox(@Param() param: _idDto) {
    const [, errors] = await this.service.deleteOneById(param._id);

    if (errors) return [null, errors];
  }
}
