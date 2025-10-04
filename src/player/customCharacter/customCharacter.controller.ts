import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { _idDto } from '../../common/dto/_id.dto';
import { ModelName } from '../../common/enum/modelName.enum';
import { UpdateCustomCharacterDto } from './dto/updateCustomCharacter.dto';
import { CustomCharacterService } from './customCharacter.service';
import { CreateCustomCharacterDto } from './dto/createCustomCharacter.dto';
import { CustomCharacterDto } from './dto/customCharacter.dto';
import { Authorize } from '../../authorization/decorator/Authorize';
import { Action } from '../../authorization/enum/action.enum';
import { AddSearchQuery } from '../../common/interceptor/request/addSearchQuery.interceptor';
import { GetAllQuery } from '../../common/decorator/param/GetAllQuery';
import { IGetAllQuery } from '../../common/interface/IGetAllQuery';
import { OffsetPaginate } from '../../common/interceptor/request/offsetPagination.interceptor';
import { AddSortQuery } from '../../common/interceptor/request/addSortQuery.interceptor';
import { LoggedUser } from '../../common/decorator/param/LoggedUser.decorator';
import { User } from '../../auth/user';
import { UniformResponse } from '../../common/decorator/response/UniformResponse';
import { IncludeQuery } from '../../common/decorator/param/IncludeQuery.decorator';
import { publicReferences } from './customCharacter.schema';
import ApiResponseDescription from '../../common/swagger/response/ApiResponseDescription';
import EventEmitterService from '../../common/service/EventEmitterService/EventEmitter.service';
import { ServerTaskName } from '../../dailyTasks/enum/serverTaskName.enum';

@Controller('customCharacter')
export class CustomCharacterController {
  public constructor(
    private readonly service: CustomCharacterService,
    private readonly emitterService: EventEmitterService,
  ) {}

  /**
   * Create a custom character
   *
   * @remarks Create a new CustomCharacter. CustomCharacter represents a character of the Player.
   * Player can have many CustomCharacters, CustomCharacter can belong to only one Player.
   *
   * Notice that the player_id field will be determined based on the logged-in player.
   *
   * Notice that player can have only one custom character of each type
   */
  @ApiResponseDescription({
    success: {
      dto: CustomCharacterDto,
      modelName: ModelName.CUSTOM_CHARACTER,
      status: 201,
    },
    errors: [400, 401],
  })
  @Post()
  @Authorize({ action: Action.create, subject: CustomCharacterDto })
  @UniformResponse(ModelName.CUSTOM_CHARACTER, CustomCharacterDto)
  public create(
    @Body() body: CreateCustomCharacterDto,
    @LoggedUser() user: User,
  ) {
    return this.service.createOne(body, user.player_id);
  }

  /**
   * Get logged-in player chosen battle CustomCharacters
   *
   * @remarks Get logged-in player chosen CustomCharacters for a battle
   */
  @ApiResponseDescription({
    success: {
      dto: CustomCharacterDto,
      modelName: ModelName.CUSTOM_CHARACTER,
      returnsArray: true,
    },
    errors: [401, 404],
  })
  @Get('/battleCharacters')
  @Authorize({ action: Action.read, subject: CustomCharacterDto })
  @UniformResponse(ModelName.CUSTOM_CHARACTER, CustomCharacterDto)
  public async getBattleCharacters(@LoggedUser() user: User) {
    return this.service.readPlayerBattleCharacters(user.player_id);
  }

  /**
   * Get CustomCharacter by _id
   *
   * @remarks Read CustomCharacter data by its _id field.
   *
   * Notice that if the CustomCharacter does not belong to the logged-in Player 404 should be returned.
   */
  @ApiResponseDescription({
    success: {
      dto: CustomCharacterDto,
      modelName: ModelName.CUSTOM_CHARACTER,
    },
    errors: [400, 401, 404],
  })
  @Get('/:_id')
  @Authorize({ action: Action.read, subject: CustomCharacterDto })
  @UniformResponse(ModelName.CUSTOM_CHARACTER, CustomCharacterDto)
  public async get(
    @Param() param: _idDto,
    @IncludeQuery(publicReferences) includeRefs: ModelName[],
    @LoggedUser() user: User,
  ) {
    return this.service.readOne({
      includeRefs,
      filter: { _id: param._id, player_id: user.player_id },
    });
  }

  /**
   * Get all CustomCharacters of the logged-in player
   *
   * @remarks Read all custom characters. Remember about the pagination
   */
  @ApiResponseDescription({
    success: {
      dto: CustomCharacterDto,
      modelName: ModelName.CUSTOM_CHARACTER,
      returnsArray: true,
    },
    errors: [401, 404],
  })
  @Get()
  @Authorize({ action: Action.read, subject: CustomCharacterDto })
  @OffsetPaginate(ModelName.CUSTOM_CHARACTER)
  @AddSearchQuery(CustomCharacterDto)
  @AddSortQuery(CustomCharacterDto)
  @UniformResponse(ModelName.CUSTOM_CHARACTER, CustomCharacterDto)
  public async getAll(
    @GetAllQuery() query: IGetAllQuery,
    @LoggedUser() user: User,
  ) {
    return this.service.readMany({
      ...query,
      filter: { ...query.filter, player_id: user.player_id },
    });
  }

  /**
   * Update custom character by _id
   *
   * @remarks Update the CustomCharacter, which _id is specified in the body.
   *
   * Only the Player, that owns the CustomCharacter can change it. In case the Player does not own the CustomCharacter the 404 is returned.
   */
  @ApiResponseDescription({
    success: {
      status: 204,
    },
    errors: [400, 401, 404],
  })
  @Put()
  @Authorize({ action: Action.update, subject: UpdateCustomCharacterDto })
  @UniformResponse(ModelName.CUSTOM_CHARACTER)
  public async update(
    @Body() body: UpdateCustomCharacterDto,
    @LoggedUser() user: User,
  ) {
    const [, errors] = await this.service.updateOneByCondition(body, {
      filter: { player_id: user.player_id, _id: body._id },
    });
    if (errors) return [null, errors];

    this.emitterService.EmitNewDailyTaskEvent(
      user.player_id,
      ServerTaskName.CHANGE_CHARACTER_STATS,
    );
  }
}
