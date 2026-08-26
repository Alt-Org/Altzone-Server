import { Body, Controller, Post, Put } from '@nestjs/common';
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
import { StartBattleDto } from './dto/startBattle.dto';
import { SubmitResultDto } from './dto/submitResult.dto';

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
   * Initialize a new battle record
   * * @remarks This endpoint is used to register the start of a battle.
   * It creates a record in the database with the initial participants and returns the unique match ID.
   * * This match ID must be stored by the client and used in the `PUT battle/result` call.
   */
  @ApiResponseDescription({
    success: {
      status: 201,
    },
    errors: [400, 401, 403],
  })
  @Post('battle/start')
  @UniformResponse()
  async startBattle(
    @LoggedUser() user: User, // require logged-in user
    @Body() startBattleDto: StartBattleDto,
  ) {
    // is the user is logged-in
    if (!user) {
      return new APIError({
        reason: APIErrorReason.NOT_AUTHENTICATED,
        message: 'User must be logged in to start a battle',
      });
    }

    // get the player_id of the user
    const playerId = user.player_id;

    // Check if the user is in both teams
    if (
      startBattleDto.team1.includes(playerId) &&
      startBattleDto.team2.includes(playerId)
    ) {
      return new APIError({
        reason: APIErrorReason.NOT_ALLOWED,
        message: 'User cannot be in both teams',
      });
    }

    // are either of the teams empty?
    if (
      startBattleDto.team1.length === 0 ||
      startBattleDto.team2.length === 0
    ) {
      return new APIError({
        reason: APIErrorReason.BAD_REQUEST,
        message: 'Both teams must have at least one player',
      });
    }

    return this.service.registerBattle(startBattleDto, playerId);
  }

  /**
   * Submit player battle result
   * * @remarks Endpoint for players to report the outcome of a specific match.
   * * The logic will compare the result with other players in the same matchId.
   * If all results match, the battle is finalized and rewards are calculated.
   * * Notice that if results conflict, the battle status will move to "PROCESSING"
   * for further verification.
   * * @param user - The authenticated player submitting the result.
   * @param dto - Contains the matchId, winning team, and match duration.
   */
  @ApiResponseDescription({
    success: {
      dto: BattleResponseDto,
    },
    errors: [400, 401, 403, 404],
  })
  @Put('battle/result')
  async submitResult(
    @LoggedUser() user: User,
    @Body() SubmitResultDto: SubmitResultDto,
  ) {
    const legacyDto = new BattleResultDto();
    legacyDto.matchId = SubmitResultDto.matchId;
    legacyDto.result = SubmitResultDto.result;
    legacyDto.duration = SubmitResultDto.duration;

    return this.service.handleBattleResult(
      legacyDto as BattleResultDto,
      user,
    );
  }
}
