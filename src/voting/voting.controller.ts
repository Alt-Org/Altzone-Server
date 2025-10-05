import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { VotingService } from './voting.service';
import { UniformResponse } from '../common/decorator/response/UniformResponse';
import { ModelName } from '../common/enum/modelName.enum';
import { _idDto } from '../common/dto/_id.dto';
import { LoggedUser } from '../common/decorator/param/LoggedUser.decorator';
import { User } from '../auth/user';
import { VotingDto } from './dto/voting.dto';
import { AddVoteDto } from './dto/addVote.dto';
import { noPermissionError } from './error/noPermission.error';
import ApiResponseDescription from '../common/swagger/response/ApiResponseDescription';
import { ServerTaskName } from '../dailyTasks/enum/serverTaskName.enum';
import EventEmitterService from '../common/service/EventEmitterService/EventEmitter.service';

@Controller('voting')
export class VotingController {
  constructor(
    private readonly service: VotingService,
    private readonly emitterService: EventEmitterService,
  ) {}

  /**
   * Get all votings
   *
   * @remarks Get all active votings of the logged user clan.
   */
  @ApiResponseDescription({
    success: {
      dto: VotingDto,
      modelName: ModelName.VOTING,
      returnsArray: true,
    },
    errors: [401, 404],
  })
  @Get()
  @UniformResponse(ModelName.VOTING, VotingDto)
  async getClanVotings(@LoggedUser() user: User) {
    return this.service.getClanVotings(user.player_id);
  }

  /**
   * Get voting by _id
   *
   * @remarks Get data of the voting state.
   *
   * Notice that it can return 403 in case the logged-in player does not have permission to access the voting,
   * for example if the player tries to access a voting that is an internal for other Clan.
   */
  @ApiResponseDescription({
    success: {
      dto: VotingDto,
      modelName: ModelName.VOTING,
    },
    errors: [400, 401, 403, 404],
  })
  @Get('/:_id')
  @UniformResponse(ModelName.VOTING, VotingDto)
  async getVoting(@Param() param: _idDto, @LoggedUser() user: User) {
    const permission = await this.service.validatePermission(
      param._id,
      user.player_id,
    );
    if (!permission) return noPermissionError;

    return await this.service.basicService.readOneById(param._id);
  }

  /**
   * Send a vote
   *
   * @remarks Send a vote.
   *
   * The minimum acceptance percentage referring to the min percentage of a group members that need to accept some option
   * for the voting to be concluded. For example Clan members are voting whenever they want to sell an Item or not
   * and the min percentage might be 51 => if 51% of all this Clan members accept to sell the Item then the Item can be sold
   * and otherwise if the 51% of Clan members reject to sell the Item it will not be sold.
   * Same logic can be applied if there are more than 2 options available.
   *
   * Voting endpoint is served for different kinds of votings. The "type" field is an enum and determines what value the "choice" field may have.
   *
   * ### selling_item
   *
   * Player votes whenever he/she wants that an item is going for sale to the flea market.
   * The voter must be a member of the Clan from which item is going to sale, otherwise 403 will be returned.
   * The min acceptance percentage is 51%. Notice that during the voting process there will be sent different notifications via MQTT:
   *
   * - new voting started
   * - somebody has voted
   * - voting ended
   *
   * ### buying_item
   *
   * Player votes whenever he/she wants that an item should be bought from the flea market or not.
   * The voter must be a member of the Clan for which item is going to be bought, otherwise 403 will be returned.
   * The min acceptance percentage is 51%. The time limit for the voting is 10 mins.
   *
   * Notice that during the voting process there will be sent different notifications via MQTT:
   *
   * - new voting started
   * - somebody has voted
   * - voting ended
   * - error if time limit expired
   */
  @ApiResponseDescription({
    success: {
      dto: VotingDto,
      modelName: ModelName.VOTING,
    },
    errors: [400, 401, 403, 404],
  })
  @Put()
  @UniformResponse()
  async addVote(@Body() body: AddVoteDto, @LoggedUser() user: User) {
    const permission = await this.service.validatePermission(
      body.voting_id,
      user.player_id,
    );
    if (!permission) return noPermissionError;

    this.service.addVote(body.voting_id, body.choice, user.player_id);

    this.emitterService.EmitNewDailyTaskEvent(
      user.player_id,
      ServerTaskName.PARTICIPATE_CLAN_VOTING,
    );
  }
}
