import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/createPlayer.dto';
import { UpdatePlayerDto } from './dto/updatePlayer.dto';
import { UpdateEmotionDto } from './dto/updateEmotion.dto';
import { PlayerDto } from './dto/player.dto';
import { _idDto } from '../common/dto/_id.dto';
import { BasicDELETE } from '../common/base/decorator/BasicDELETE.decorator';
import { ModelName } from '../common/enum/modelName.enum';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import { Authorize } from '../authorization/decorator/Authorize';
import { Action } from '../authorization/enum/action.enum';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { OffsetPaginate } from '../common/interceptor/request/offsetPagination.interceptor';
import { AddSearchQuery } from '../common/interceptor/request/addSearchQuery.interceptor';
import { GetAllQuery } from '../common/decorator/param/GetAllQuery';
import { IGetAllQuery } from '../common/interface/IGetAllQuery';
import { AddSortQuery } from '../common/interceptor/request/addSortQuery.interceptor';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { publicReferences } from './schemas/player.schema';
import { IncludeQuery } from '../common/decorator/param/IncludeQuery.decorator';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import EventEmitterService from '../common/service/EventEmitterService/EventEmitter.service';
import { ServerTaskName } from '../dailyTasks/enum/serverTaskName.enum';
import { isEqual } from 'lodash';
import { IServiceReturn } from '../common/service/basicService/IService';
import { EmotionCheckDto } from './dto/emotionCheck.dto';
import { MongooseError } from 'mongoose';

@Controller('player')
export default class PlayerController {
  public constructor(
    private readonly service: PlayerService,
    private readonly emitterService: EventEmitterService,
  ) {}

  /**
   * Create a player
   *
   * @remarks Create a new Player. This is not recommended way of creating a new Player and it should be used only in edge cases.
   * The recommended way is to create it via /profile POST endpoint.
   *
   * Player is representing an object, which holds data related to game player. This object can be used inside the game for example while joining a Clan.
   * Notice, that the Profile object should not be used inside the game (except for logging-in).
   */
  @ApiResponseDescription({
    success: { dto: PlayerDto, modelName: ModelName.PLAYER, status: 201 },
    errors: [400, 401, 403, 409],
    hasAuth: false,
  })
  @NoAuth()
  @Post()
  @UniformResponse(ModelName.PLAYER, PlayerDto)
  public create(@Body() body: CreatePlayerDto) {
    return this.service.createOne(body);
  }

  /**
   * Player emotion check
   * Checks if the authenticated player has already submitted an emotion for the current day.
   */
  @ApiResponseDescription({
    success: { status: 200 },
    errors: [401, 403, 404],
  })
  @Get('/emotioncheck')
  @Authorize({ action: Action.read, subject: PlayerDto })
  public async checkDailyEmotion(
    @LoggedUser() user: User,
  ): Promise<IServiceReturn<boolean>> {
    return await this.service.checkIfEmotionSentToday(user.player_id);
  }

  /**
   * Registers the player's selected emotion for the current day.
   * 
   * @remarks Emotion must be one of these: Sorrow, Anger, Joy, Playful, Love, Blank
   */
  @ApiResponseDescription({
    success: { dto: null, modelName: ModelName.PLAYER, status: 204 },
    errors: [400, 401, 403, 409],
  })
  @Post('/emotion')
  @UniformResponse(ModelName.PLAYER, PlayerDto)
  @Authorize({ action: Action.create, subject: PlayerDto })
  public async setDailyEmotion(
    @LoggedUser() user: User,
    @Body() body: UpdateEmotionDto,
  ): Promise<void> {
    const [, error] = await this.service.addEmotion(user.player_id, body.emotion);

    if (error) {
      throw new BadRequestException(error[0].message);
    }
  }

  /**
   * Get player by _id
   *
   * @remarks Read Player data by its _id field
   */
  @ApiResponseDescription({
    success: { dto: PlayerDto, modelName: ModelName.PLAYER },
    errors: [400, 401, 404],
  })
  @Get('/:_id')
  @UniformResponse(ModelName.PLAYER, PlayerDto)
  @Authorize({ action: Action.read, subject: PlayerDto })
  public async get(
    @Param() param: _idDto,
    @IncludeQuery(publicReferences) includeRefs: ModelName[],
  ) {
    return this.service.getPlayerById(param._id, { includeRefs });
  }

  /**
   * Updates the player's carbon footprint.
   * @param id - The unique identifier of the player.
   * @param value - The amount to increment the footprint by (can be positive or negative).
   * @returns The updated player object or service errors.
   * * @example
   * PUT /player/60f7c2d9a2d3c7b7e56d01df/footprint
   * Body: { "value": 15 }
   */
  @Put(':id/footprint')
  async updateFootprint(@Param('id') id: string, @Body('value') value: number) {
    const updateQuery = { $inc: { carbonFootprint: value } };
    const [result, errors] = await this.service.updatePlayerById(
      id,
      updateQuery,
    );

    if (errors) throw errors;
    return result;
  }

  /**
   * Get all players
   *
   * @remarks Read all created Players. Remember about the pagination.
   */
  @ApiResponseDescription({
    success: { dto: PlayerDto, modelName: ModelName.PLAYER },
    errors: [401, 404],
  })
  @Get()
  @OffsetPaginate(ModelName.PLAYER)
  @AddSearchQuery(PlayerDto)
  @AddSortQuery(PlayerDto)
  @UniformResponse(ModelName.PLAYER, PlayerDto)
  public async getAll(@GetAllQuery() query: IGetAllQuery) {
    return this.service.getAll(query);
  }

  /**
   * Update player
   * * Emit a server event if avatar clothes changed
   * @remarks Update the Player, which _id is specified in the body.
   * Only Player, which belong to the logged-in Profile can be changed.
   */
  @ApiResponseDescription({
    success: { status: 204 },
    errors: [401, 403, 404, 409],
  })
  @Put()
  @HttpCode(204)
  @Authorize({ action: Action.update, subject: UpdatePlayerDto })
  @UniformResponse()
  public async update(@Body() body: UpdatePlayerDto) {
    const [player, _] = await this.service.getPlayerById(body._id);
    const playerUpdateResults = await this.service.updateOneById(body);
    await this.emitEventIfAvatarChange(player, body);
    return playerUpdateResults;

    if (playerUpdateResults instanceof MongooseError)
      return playerUpdateResults;
  }

  /**
   * Delete player by _id
   * @remarks Delete Player by its _id field. Notice that only Player, which belongs to a logged-in user Profile can be deleted.
   * In case when the Player is the only admin in some Clan and the Clan has some other Players, the Player can not be removed.
   * User should be asked to first determine at least one admin for the Clan.
   *
   * Also, it is not recommended to delete the Player since it can introduce unexpected behaviour for the user with Profile,
   * but without Player. The better way to remove the Player is do it via /profile DELETE.
   *
   * Player removal basically means removing all data, which is related to the Player:
   * CustomCharacters, Clan, except for the Profile data.
   * In the case when the Profile does not have a Player, user can only login to the system, but can not play the game.
   */
  @ApiResponseDescription({
    success: { status: 204 },
    errors: [400, 401, 403, 404],
  })
  @Delete('/:_id')
  @Authorize({ action: Action.delete, subject: PlayerDto })
  @BasicDELETE(ModelName.PLAYER)
  public async delete(@Param() param: _idDto) {
    return this.service.deleteOneById(param._id);
  }

  /**
   * Check if avatar changed and emit event
   * @param player Current player data
   * @param body UpdatePlayerDto with new data
   */
  private async emitEventIfAvatarChange(
    player: PlayerDto,
    body: UpdatePlayerDto,
  ) {
    if (player?.avatar?.clothes?.id !== body?.avatar?.clothes?.id) {
      this.emitterService.EmitNewDailyTaskEvent(
        body._id,
        ServerTaskName.CHANGE_AVATAR_CLOTHES,
      );
    }

    const oldAvatar = JSON.parse(JSON.stringify(player?.avatar ?? {}));
    const newAvatar = JSON.parse(JSON.stringify(body?.avatar ?? {}));

    if (!isEqual(oldAvatar, newAvatar)) {
      this.emitterService.EmitNewDailyTaskEvent(
        body._id,
        ServerTaskName.CHANGE_AVATAR_OUTLOOK,
      );
    }
  }
}
