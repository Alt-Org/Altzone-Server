import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Game } from './game.schema';
import { Model, Types } from 'mongoose';
import BasicService from '../common/service/basicService/BasicService';
import { CreateGameDto } from './dto/createGame.dto';
import { PlayerService } from '../player/player.service';
import ServiceError from '../common/service/basicService/ServiceError';
import { JwtService } from '@nestjs/jwt';
import { ClanService } from '../clan/clan.service';
import { ModelName } from '../common/enum/modelName.enum';
import { BattleResultDto } from './dto/battleResult.dto';
import { StartBattleDto } from './dto/startBattle.dto';
import { BattleStatus } from './enum/battleStatus.enum';
import { GameDocument } from './game.schema';
import { User } from '../auth/user';
import { GameDto } from './dto/game.dto';
import { BattleResponseDto } from './dto/battleResponse.dto';
import { RoomService } from '../clanInventory/room/room.service';
import { GameEventsHandler } from '../gameEventsHandler/gameEventsHandler';
import { GameEventType } from '../gameEventsHandler/enum/GameEventType.enum';
import { IServiceReturn } from '../common/service/basicService/IService';
import { SEReason } from '../common/service/basicService/SEReason';
import { ServerTaskName } from '../dailyTasks/enum/serverTaskName.enum';
import EventEmitterService from '../common/service/EventEmitterService/EventEmitter.service';

@Injectable()
export class GameDataService {
  constructor(
    @InjectModel(Game.name) public readonly model: Model<Game>,
    public readonly playerService: PlayerService,
    public readonly clanService: ClanService,
    public readonly roomService: RoomService,
    private readonly gameEventsBroker: GameEventsHandler,
    private readonly jwtService: JwtService,
    private readonly emitterService: EventEmitterService,
  ) {
    this.basicService = new BasicService(model);
    this.refsInModel = [ModelName.STOCK];
    this.modelName = ModelName.ITEM;
  }

  public readonly basicService: BasicService;
  public readonly refsInModel: ModelName[];
  public readonly modelName: ModelName;

  /**
   * Handles the result type request.
   *
   * @param battleResult - The battleResult of the request containing battle result data.
   * @param user - The user making the request.
   * @returns - Returns a promise that resolves to the response or an API error.
   */
  async handleResultType(
    battleResult: BattleResultDto,
    user: User,
  ): Promise<IServiceReturn<BattleResponseDto>> {
    const currentTime = new Date();

    const winningTeam =
      battleResult.result === 1 ? battleResult.team1 : battleResult.team2;
    const playerInWinningTeam = winningTeam.includes(user.player_id);

    if (!playerInWinningTeam) {
      this.gameEventsBroker.handleEvent(
        user.player_id,
        GameEventType.PLAYER_LOSE_BATTLE,
      );

      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_ALLOWED,
            message:
              'Player is not in the winning team and therefore is not allowed to steal',
          }),
        ],
      ];
    }

    this.gameEventsBroker.handleEvent(
      user.player_id,
      GameEventType.PLAYER_WIN_BATTLE,
    );
    const [teamIds, teamIdsErrors] = await this.getClanIdForTeams([
      battleResult.team1[0],
      battleResult.team2[0],
    ]);
    if (teamIdsErrors) return [null, teamIdsErrors];

    this.createGameIfNotExists(battleResult, teamIds, currentTime);

    this.emitterService.EmitNewDailyTaskEvent(
      user.player_id,
      ServerTaskName.PLAY_BATTLE,
    );

    return this.generateResponse(
      battleResult,
      teamIds.team1Id,
      teamIds.team2Id,
      user,
    );
  }

  /**
   * Creates a new game in DB.
   *
   * @param game - Game data to create
   * @returns created Item or an array of service errors if any occurred.
   */
  private async createOne(game: CreateGameDto) {
    return await this.basicService.createOne<CreateGameDto, GameDto>(game);
  }

  /**
   * Creates a new game object based on the provided battle result and team information.
   *
   * @param battleResult - The battle result data transfer object containing details of the battle.
   * @param team1Id - The identifier for team 1's clan.
   * @param team2Id - The identifier for team 2's clan.
   * @param currentTime - The current date and time when the game is being created.
   * @returns A new game data transfer object ready to be saved in the database.
   */
  private createNewGameObject(
    battleResult: BattleResultDto,
    team1Id: string,
    team2Id: string,
    currentTime: Date,
  ) {
    const newGame: CreateGameDto = {
      team1: battleResult.team1,
      team2: battleResult.team2,
      team1Clan: team1Id,
      team2Clan: team2Id,
      winner: battleResult.result,
      startedAt: new Date(currentTime.getTime() - battleResult.duration * 1000),
      endedAt: currentTime,
    };
    return newGame;
  }

  /**
   * Generates a response for the battle result, including a steal token, SoulHome ID, and room IDs.
   *
   * @param battleResult - The battle result data transfer object.
   * @param team1ClanId - The identifier for team 1's clan.
   * @param team2ClanId - The identifier for team 2's clan.
   * @param user - The user who is submitting the battle result.
   * @returns - A promise that resolves to an array containing the response object and any service errors.
   */
  private async generateResponse(
    battleResult: BattleResultDto,
    team1ClanId: string,
    team2ClanId: string,
    user: User,
  ): Promise<[BattleResponseDto, ServiceError[]]> {
    const [clan, errors] = await this.clanService.readOneById(
      battleResult.result === 1 ? team2ClanId : team1ClanId,
      { includeRefs: [ModelName.SOULHOME] },
    );
    if (errors) {
      return [null, errors];
    }
    const [roomIds, roomErrors] = await this.getRoomIds(clan.SoulHome._id);
    if (roomErrors) {
      return [null, roomErrors];
    }

    const stealToken = await this.generateStealToken(
      user.player_id,
      clan.SoulHome._id,
    );
    const response: BattleResponseDto = {
      stealToken,
      soulHome_id: clan.SoulHome._id,
      roomIds,
    };
    return [response, null];
  }

  /**
   * Checks if a game with given information exists in DB.
   *
   * This function uses data from the client request which doesn't
   * include any uniquely identifiable data. This is why the function
   * tries to find the latest game between these teams and if the
   * game found is older then 30 seconds it returns false.
   * This number can be changed based on how long the games and
   * requests from the client to server take.
   *
   * @param team1 - Player ids of team1 players
   * @param team2 - Player ids of team2 players
   * @param currentTime - Current time
   * @returns - Returns a promise that resolves to true in a game exists, otherwise false
   */
  private async gameAlreadyExists(
    team1: string[],
    team2: string[],
    currentTime: Date,
  ) {
    const game = await this.model
      .findOne({
        team1: { $all: team1 },
        team2: { $all: team2 },
      })
      .sort({ endedAt: -1 })
      .exec();

    if (!game) return false;

    if (game.endedAt.getTime() < currentTime.getTime() - 30 * 1000)
      return false;

    return true;
  }

  /**
   * Retrieves the clan IDs for the given player IDs.
   *
   * @param playerIds - An array containing the player IDs of the first player from each team.
   * @returns - A promise that resolves to an object containing the clan IDs for both teams and any service errors.
   */
  private async getClanIdForTeams(
    playerIds: string[],
  ): Promise<[{ team1Id: string; team2Id: string }, ServiceError[]]> {
    const [team1Player, team1Errors] = await this.playerService.getPlayerById(
      playerIds[0],
    );
    if (team1Errors) {
      return [null, team1Errors as ServiceError[]];
    }

    const [team2Player, team2Errors] = await this.playerService.getPlayerById(
      playerIds[1],
    );
    if (team2Errors) {
      return [null, team2Errors as ServiceError[]];
    }

    const clanIds = {
      team1Id: team1Player.clan_id.toString(),
      team2Id: team2Player.clan_id.toString(),
    };
    return [clanIds, null];
  }

  /**
   * Generates a steal token for a winning player.
   *
   * @param playerId - The ID of the winning player.
   * @param soulHomeId - The ID of the losing team SoulHome.
   * @returns - A promise that resolves to the generated steal token.
   */
  private async generateStealToken(
    playerId: string,
    soulHomeId: string,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      { playerId, soulHomeId },
      { expiresIn: '15m' },
    );
  }

  /**
   * Retrieves the IDs of all rooms associated with a given SoulHome.
   *
   * @param soulHomeId - The ID of the SoulHome.
   * @returns - A promise that resolves to an array containing the room IDs and any service errors.
   */
  private async getRoomIds(
    soulHomeId: string,
  ): Promise<[string[], ServiceError[]]> {
    const [rooms, roomErrors] =
      await this.roomService.readAllSoulHomeRooms(soulHomeId);
    if (roomErrors) {
      return [null, roomErrors];
    }

    const roomIds = rooms.map((room) => room._id);
    return [roomIds, null];
  }

  /**
   * Checks if a game already exists and creates a new game if not.
   *
   * @param battleResult - The battle result data transfer object.
   * @param teamIds - The clan IDs for both teams.
   * @param currentTime - The current time.
   *
   * @returns - A Promise that resolves into GameDto or ServiceError[]
   */
  private async createGameIfNotExists(
    battleResult: BattleResultDto,
    teamIds: { team1Id: string; team2Id: string },
    currentTime: Date,
  ) {
    const existingGame = await this.gameAlreadyExists(
      battleResult.team1,
      battleResult.team2,
      currentTime,
    );
    if (!existingGame) {
      const newGame = this.createNewGameObject(
        battleResult,
        teamIds.team1Id,
        teamIds.team2Id,
        currentTime,
      );
      return await this.createOne(newGame);
    }
  }

  /**
   * Initializes a new battle record in the database.
   * Sets the initial status to OPEN.
   * * @param dto - The data required to start a battle, including the matchId and teams.
   * @returns A promise resolving to the created Battle document.
   */
  async registerBattle(dto: StartBattleDto): Promise<GameDocument> {
    const matchId = dto.matchId || new Types.ObjectId().toHexString();
    const newBattle = new this.model({
      _id: matchId,
      gameType: 'BATTLE',
      ...dto,
      status: BattleStatus.OPEN,
      receivedResults: [],
    });
    return newBattle.save();
  }

  /**
   * Processes a result claim from a player.
   * If results from both teams match, the battle is marked COMPLETED.
   * If results don't match, the battle enters PROCESSING and triggers a timeout-based resolution.
   * * @param dto - The result containing matchId, winning team, and duration.
   * @param playerId - The ID of the player submitting the result.
   * @returns A promise to the updated Battle document.
   * @throws Error if the matchId is not found in the database.
   */
  async handleBattleResult(dto: BattleResultDto, playerId: string) {
    const battle = await this.model.findById(dto.matchId);
    if (!battle) throw new Error('Match not found');

    battle.receivedResults.push({
      playerId,
      winnerTeam: dto.result,
      duration: dto.duration,
    });

    if (battle.receivedResults.length >= 2) {
      const results = battle.receivedResults.map((r) => r.winnerTeam);
      const allMatch = results.every((val) => val === results[0]);

      if (allMatch) {
        battle.status = BattleStatus.COMPLETED;
        battle.finalWinner = results[0];
        await battle.save();
        return await this.generateRaidTokens(battle);
      } else {
        battle.status = BattleStatus.PROCESSING;
        this.startFinalCallTimer(battle._id.toString());
      }
    } else {
      battle.status = BattleStatus.OPEN;
    }

    return await battle.save();
  }

  /**
   * Distributes rewards (Raid Tokens) to the members of the winning team.
   * This method is triggered only when a final winner has been determined.
   * * @param battle - The validated Battle document with a set finalWinner.
   * @returns A promise resolving to the saved Battle document after reward distribution.
   * @private
   */
  private async generateRaidTokens(battle: GameDocument) {
    const winners =
      (battle.finalWinner === 1 ? battle.team1 : battle.team2) || [];

    return await battle.save();
  }

  /**
   * Triggers the "Final Call" timer for conflicting battle results.
   * Waits for 2 minutes before forcibly resolving the conflict.
   * * @param matchId - The unique identifier for the match in conflict.
   * @private
   */
  private startFinalCallTimer(matchId: string) {
    setTimeout(() => {
      this.resolveConflict(matchId);
    }, 120000);
  }

  /**
   * Forcibly resolves a battle conflict after the "Final Call" period.
   * Uses a majority vote based on received results and defaults to Team 1 if tied.
   * * @param matchId - The unique identifier of the battle to resolve.
   * @returns A promise that resolves once the conflict is settled and rewards are issued.
   * @private
   */
  private async resolveConflict(matchId: string) {
    const battle = await this.model.findOne({ matchId });
    if (!battle || battle.status === BattleStatus.COMPLETED) return;

    const results = battle.receivedResults;
    const team1Votes = results.filter((r) => r.winnerTeam === 1).length;
    const team2Votes = results.filter((r) => r.winnerTeam === 2).length;

    const finalWinner = team2Votes > team1Votes ? 2 : 1;

    battle.status = BattleStatus.COMPLETED;
    battle.finalWinner = finalWinner;
    await battle.save();

    await this.generateRaidTokens(battle);
  }
}
