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
import { CreateGroupAdminDto } from './groupAdmin/dto/createGroupAdmin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { GroupAdmin } from './groupAdmin/groupAdmin.schema';
import { Model } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { NoBoxIdFilter } from './auth/decorator/NoBoxIdFilter.decorator';
import { errors } from 'mongodb-memory-server';

@Controller('box')
@UseGuards(BoxAuthGuard)
export class BoxController {
  public constructor(
    @InjectModel(GroupAdmin.name) public readonly groupModel: Model<GroupAdmin>,
    private readonly service: BoxService,
    private readonly boxCreator: BoxCreator,
    private readonly authHandler: BoxAuthHandler,
    private readonly sessionStarter: SessionStarterService,
  ) {
    this.adminBasicService = new BasicService(groupModel);
  }

  private readonly adminBasicService: BasicService;

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
  @NoAuth()
  @Post()
  @NoBoxIdFilter()
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
  @SwaggerTags('Release on 27.07.2025', 'Box')
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
      status: 204,
    },
    errors: [401, 403, 404],
  })
  @SwaggerTags('Release on 27.07.2025', 'Box')
  @Put('reset')
  @UniformResponse()
  @IsGroupAdmin()
  async resetTestingSession(@LoggedUser() user: BoxUser) {
    const [, errors] = await this.service.reset(user.box_id);

    if (errors) return [null, errors];
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
    errors: [401, 403, 404],
  })
  @SwaggerTags('Release on 10.08.2025', 'Box')
  @Delete()
  @IsGroupAdmin()
  @UniformResponse()
  async deleteBoxAndAdmin(@LoggedUser() user: BoxUser) {
    const [, errors] = await this.service.deleteBox(user.box_id);
    if (errors) return [null, errors];
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
   * Create a group admin. The endpoint for time of development only
   *
   * @remarks Create a group admin.
   *
   * The group admin is required in order to use the endpoints starting with "/box",
   * i.e. for box initialization or changing its settings. Read the docs for more info.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 409],
    hasAuth: false,
  })
  @SwaggerTags('Release on 27.07.2025', 'Box')
  @Post('/createAdmin')
  @NoAuth()
  @NoBoxIdFilter()
  @UniformResponse()
  public async createAdmin(@Body() body: CreateGroupAdminDto) {
    const [, creationErrors] = await this.adminBasicService.createOne(body);

    if (creationErrors) return [null, creationErrors];
  }

  /**
   * Get all boxes. The endpoint for time of development only
   *
   * @remarks Endpoint for getting all boxes data
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
  @Get('/')
  @NoAuth()
  @NoBoxIdFilter()
  @UniformResponse(ModelName.BOX)
  public getAll() {
    return this.service.readAll();
  }

  /**
   * Get box by _id. The endpoint for time of development only
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
  @Get('/:_id')
  @NoBoxIdFilter()
  @NoAuth()
  @UniformResponse(ModelName.BOX)
  public getOne(
    @Param() param: _idDto,
    @IncludeQuery(publicReferences as any) includeRefs: ModelName[],
  ) {
    return this.service.readOneById(param._id, { includeRefs });
  }

  /**
   * Delete box by _id. The endpoint for time of development only
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
  @Delete('/:_id')
  @NoBoxIdFilter()
  @NoAuth()
  @UniformResponse(ModelName.BOX)
  async deleteBox(@Param() param: _idDto) {
    const [, errors] = await this.service.deleteBox(param._id);

    if (errors) return [null, errors];
  }
}
