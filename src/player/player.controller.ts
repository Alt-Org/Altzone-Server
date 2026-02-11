import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/createPlayer.dto';
import { UpdatePlayerDto } from './dto/updatePlayer.dto';
import { UpdateEmotionDto } from './dto/updateEmotion.dto';
import { PlayerDto } from './dto/player.dto';
import { _idDto } from '../common/dto/_id.dto';
import { BasicDELETE } from '../common/base/decorator/BasicDELETE.decorator';
import { BasicPUT } from '../common/base/decorator/BasicPUT.decorator';
import { ModelName } from '../common/enum/modelName.enum';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';
import { Authorize } from '../authorization/decorator/Authorize';
import { Action } from '../authorization/enum/action.enum';
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

@Controller('player')
export default class PlayerController {
  public constructor(
    private readonly service: PlayerService,
    private readonly emitterService: EventEmitterService,
  ) {}

  /**
   * Create a player
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
   * Checks if the authenticated player has already submitted an emotion for the current day.
   * This is used by the game client on startup to determine if the emotion selection
   * popup should be displayed or not.
   * @param req - The request object containing the authenticated user's data.
   * @returns An object containing `sentToday` (boolean).
   */
  @Get('/emotioncheck')
  async checkDailyEmotion(@Req() req) {
    const sentToday = await this.service.checkIfEmotionSentToday(
      req.user.player_id,
    );
    return { sentToday };
  }

  /**
   * Registers the player's selected emotion for the current day.
   * This will append the emotion to the player's history.
   * @param req - The request object containing the authenticated user's data.
   * @param body - The DTO containing the selected PlayerEmotion enum value.
   * @returns The updated player document including the new emotion entry.
   * @throws BadRequestException - If the player attempts to submit more than once per day.
   */
  @Post('/emotion')
  @UniformResponse(ModelName.PLAYER, PlayerDto)
  async setDailyEmotion(@Req() req, @Body() body: UpdateEmotionDto) {
    return this.service.addEmotion(req.user.player_id, body.emotion);
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
   * Get all players
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
   */
  @ApiResponseDescription({
    success: { status: 204 },
    errors: [401, 403, 404, 409],
  })
  @Put()
  @HttpCode(204)
  @Authorize({ action: Action.update, subject: UpdatePlayerDto })
  @BasicPUT(ModelName.PLAYER)
  public async update(@Body() body: UpdatePlayerDto) {
    const [player, _] = await this.service.getPlayerById(body._id);
    const playerUpdateResults = await this.service.updateOneById(body);
    await this.emitEventIfAvatarChange(player, body);
    return playerUpdateResults;
  }

  /**
   * Delete player by _id
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

  private async emitEventIfAvatarChange(
    player: PlayerDto,
    body: UpdatePlayerDto,
  ) {
    if (player?.avatar?.clothes !== body?.avatar?.clothes) {
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
