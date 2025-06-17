import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameDataService } from './gameData.service';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { APIError } from '../common/controller/APIError';
import { APIErrorReason } from '../common/controller/APIErrorReason';
import { validate } from 'class-validator';
import { RequestType } from './enum/requestType.enum';
import { RequestTypeDto } from './dto/requestType.dto';
import { BattleResultDto } from './dto/battleResult.dto';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { BattleResponseDto } from './dto/battleResponse.dto';
import { NoAuth } from '../auth/decorator/NoAuth.decorator';

@Controller('gameData')
export class GameDataController {
  constructor(private readonly service: GameDataService) {}

  /**
   * Inform API about battle
   *
   * @remarks Endpoint for notifying the API about battle events or any other data.
   *
   * Notice, that the field type is required and determines the type of the data.
   *
   * Notice that the type also determines shape of the body. Examples, for each type can be found in request examples section.
   *
   * ### Type field
   * #### result
   *
   * Result of the battle, all players of the battle should send this data.
   *
   * Notice that team1 and team2 should hold game's player's _id fields.
   *
   * As a response for winners an access token will be returned, which can be used when stealing Items from losed Clan's SoulHome.
   * Notice that the steal token will expire after some period of time. Losers will get 403 error = they can not get the steal token.
   *
   * The steal token can be used only by the winner's Clan's members for the loser's Clan Stock.
   *
   * You can see the process flow from [this diagram](https://github.com/Alt-Org/Altzone-Server/tree/dev/doc/img/game_results)
   */
  @ApiResponseDescription({
    success: {
      dto: BattleResponseDto,
    },
    errors: [400, 401, 403, 404],
  })
  @Post('battle')
  @UniformResponse()
  async handleBattleResult(
    @Body() body: BattleResultDto,
    @LoggedUser() user: User,
  ) {
    const typeDto = new RequestTypeDto();
    typeDto.type = body.type;
    const errors = await validate(typeDto);
    if (errors.length > 0)
      return new APIError({
        reason: APIErrorReason.WRONG_ENUM,
        message: 'Invalid type',
      });

    switch (typeDto.type) {
      case RequestType.RESULT:
        return this.service.handleResultType(body, user);
      default:
        return new APIError({ reason: APIErrorReason.BAD_REQUEST });
    }
  }

  /**
   * Returns the minimum version of the game client.
   *
   * @remarks This endpoint provides the minimum version required for the game client to function correctly.
   */
  @NoAuth()
    @Get('minVersion')
    async getMinVersion(
  ) {
    const [version, error] = await this.service.getMinVersion();

    if (error) return error;

    return version;
  }
}
