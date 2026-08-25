import { Types } from 'mongoose';
import GameDataModule from '../modules/gameData.module';
import { GameDataService } from '../../../gameData/gameData.service';
import { Game } from '../../../gameData/game.schema';
import { GameType } from '../../../gameData/enum/gameType.enum';
import { BattleStatus } from '../../../gameData/enum/battleStatus.enum';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../common/service/basicService/SEReason';

describe('GameDataService battle lifecycle test suite', () => {
  const gameDataModel = GameDataModule.getGameModel();

  let gameDataService: GameDataService;

  beforeEach(async () => {
    await gameDataModel.deleteMany({});
    gameDataService = await GameDataModule.getGameDataService();
    jest
      .spyOn(gameDataService.playerService, 'getPlayerById')
      .mockImplementation(async (playerId: string) => [
        { _id: playerId } as any,
        null,
      ]);
  });

  it('Should register a battle using the provided matchId as document _id', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team1SecondPlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();
    const team2SecondPlayerId = new Types.ObjectId().toHexString();

    const battle = await gameDataService.registerBattle(
      {
        gameType: GameType.CUSTOM,
        team1: [team1PlayerId, team1SecondPlayerId],
        team2: [team2PlayerId, team2SecondPlayerId],
        matchId,
      },
      team1PlayerId,
    );

    const battleInDb = await gameDataModel.findById(matchId);

    expect(battle).not.toBeInstanceOf(ServiceError);
    const battleDocument = battle as Exclude<typeof battle, ServiceError>;
    expect(battleDocument._id.toString()).toBe(matchId);
    expect(battleDocument.gameType).toBe(GameType.CUSTOM);
    expect(battleInDb?._id.toString()).toBe(matchId);
    expect(battleInDb?.gameType).toBe(GameType.CUSTOM);
    expect(battleInDb?.status).toBe(BattleStatus.OPEN);
  });

  it('Should submit a battle result by finding the battle with matchId as _id', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();

    await gameDataService.registerBattle(
      {
        gameType: GameType.CASUAL,
        team1: [team1PlayerId],
        team2: [team2PlayerId],
        matchId,
      },
      team1PlayerId,
    );

    const battle = await gameDataService.handleBattleResult(
      {
        matchId,
        duration: 120,
        result: 1,
      } as any,
      team1PlayerId,
    );

    expect(battle).not.toBeInstanceOf(ServiceError);
    const battleDocument = battle as Exclude<typeof battle, ServiceError>;
    expect(battleDocument._id.toString()).toBe(matchId);
    expect(battleDocument.receivedResults).toHaveLength(1);
    expect(battleDocument.receivedResults[0].playerId.toString()).toBe(
      team1PlayerId,
    );
    expect(battleDocument.status).toBe(BattleStatus.OPEN);
  });

  it('Should reject battle result from a player outside the battle teams', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();
    const outsiderPlayerId = new Types.ObjectId().toHexString();
    await gameDataModel.create({
      _id: matchId,
      gameType: GameType.CASUAL,
      team1: [team1PlayerId],
      team2: [team2PlayerId],
      status: BattleStatus.OPEN,
      receivedResults: [],
    });

    const result = await gameDataService.handleBattleResult(
      {
        matchId,
        duration: 120,
        result: 1,
      } as any,
      outsiderPlayerId,
    );
    const battleInDb = await gameDataModel.findById(matchId);

    expect(result).toBeInstanceOf(ServiceError);
    expect(result).toMatchObject({
      reason: SEReason.NOT_AUTHORIZED,
      field: 'playerId',
      value: outsiderPlayerId,
      message: 'Only battle participants can submit battle results.',
    });
    expect(battleInDb?.receivedResults).toHaveLength(0);
  });

  it('Should reject duplicate battle result from the same player', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();
    await gameDataModel.create({
      _id: matchId,
      gameType: GameType.CASUAL,
      team1: [team1PlayerId],
      team2: [team2PlayerId],
      status: BattleStatus.OPEN,
      receivedResults: [
        {
          playerId: team1PlayerId,
          winnerTeam: 1,
          duration: 120,
        },
      ],
    });

    const result = await gameDataService.handleBattleResult(
      {
        matchId,
        duration: 110,
        result: 2,
      } as any,
      team1PlayerId,
    );
    const battleInDb = await gameDataModel.findById(matchId);

    expect(result).toBeInstanceOf(ServiceError);
    expect(result).toMatchObject({
      reason: SEReason.NOT_ALLOWED,
      field: 'playerId',
      value: team1PlayerId,
      message: 'Player has already submitted a result for this battle.',
    });
    expect(battleInDb?.receivedResults).toHaveLength(1);
  });

  it('Should reject battle result for a completed battle', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();
    await gameDataModel.create({
      _id: matchId,
      gameType: GameType.CASUAL,
      team1: [team1PlayerId],
      team2: [team2PlayerId],
      status: BattleStatus.COMPLETED,
      finalWinner: 1,
      receivedResults: [],
    });

    const result = await gameDataService.handleBattleResult(
      {
        matchId,
        duration: 120,
        result: 1,
      } as any,
      team1PlayerId,
    );
    const battleInDb = await gameDataModel.findById(matchId);

    expect(result).toBeInstanceOf(ServiceError);
    expect(result).toMatchObject({
      reason: SEReason.NOT_ALLOWED,
      field: 'status',
      value: BattleStatus.COMPLETED,
      message: 'Completed battle cannot receive new results.',
    });
    expect(battleInDb?.receivedResults).toHaveLength(0);
  });

  it('Should resolve a conflicting battle by document _id', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();
    const battle: Partial<Game> = {
      _id: matchId,
      gameType: GameType.CASUAL,
      team1: [team1PlayerId],
      team2: [team2PlayerId],
      status: BattleStatus.PROCESSING,
      receivedResults: [
        {
          playerId: team1PlayerId,
          winnerTeam: 1,
          duration: 120,
        },
        {
          playerId: team2PlayerId,
          winnerTeam: 2,
          duration: 120,
        },
      ],
    };

    await gameDataModel.create(battle);
    await (
      gameDataService as unknown as {
        resolveConflict: (_id: string) => Promise<void>;
      }
    ).resolveConflict(matchId);

    const battleInDb = await gameDataModel.findById(matchId);

    expect(battleInDb?.status).toBe(BattleStatus.COMPLETED);
    expect(battleInDb?.finalWinner).toBe(1);
  });

  it('Should not register a matchmaking battle through battle start', async () => {
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();
    const matchId = new Types.ObjectId().toHexString();

    const result = await gameDataService.registerBattle(
      {
        gameType: GameType.MATCHMAKING as any,
        team1: [team1PlayerId],
        team2: [team2PlayerId],
        matchId,
      },
      team1PlayerId,
    );

    expect(result).toBeInstanceOf(ServiceError);
    expect(result).toMatchObject({
      reason: SEReason.WRONG_ENUM,
      field: 'gameType',
      value: GameType.MATCHMAKING,
    });
    expect(await gameDataModel.countDocuments()).toBe(0);
  });

  it('Should not register a battle when requester is not in either team', async () => {
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();
    const requesterPlayerId = new Types.ObjectId().toHexString();

    const result = await gameDataService.registerBattle(
      {
        gameType: GameType.CASUAL,
        team1: [team1PlayerId],
        team2: [team2PlayerId],
      },
      requesterPlayerId,
    );

    expect(result).toBeInstanceOf(ServiceError);
    expect(result).toMatchObject({
      reason: SEReason.NOT_AUTHORIZED,
      message: 'Requester player must be in one of the teams',
    });
    expect(await gameDataModel.countDocuments()).toBe(0);
    expect(gameDataService.playerService.getPlayerById).not.toHaveBeenCalled();
  });

  it('Should not register a battle when either team is empty', async () => {
    const team1PlayerId = new Types.ObjectId().toHexString();

    const result = await gameDataService.registerBattle(
      {
        gameType: GameType.CASUAL,
        team1: [team1PlayerId],
        team2: [],
      },
      team1PlayerId,
    );

    expect(result).toBeInstanceOf(ServiceError);
    expect(result).toMatchObject({
      reason: SEReason.MISCONFIGURED,
      message: 'Both teams must have at least one player',
    });
    expect(await gameDataModel.countDocuments()).toBe(0);
    expect(gameDataService.playerService.getPlayerById).not.toHaveBeenCalled();
  });

  it('Should not register a battle when a player is in both teams', async () => {
    const sharedPlayerId = new Types.ObjectId().toHexString();

    const result = await gameDataService.registerBattle(
      {
        gameType: GameType.CASUAL,
        team1: [sharedPlayerId],
        team2: [sharedPlayerId],
      },
      sharedPlayerId,
    );

    expect(result).toBeInstanceOf(ServiceError);
    expect(result).toMatchObject({
      reason: SEReason.MISCONFIGURED,
      message: 'A player cannot be in both teams',
    });
    expect(await gameDataModel.countDocuments()).toBe(0);
  });

  it('Should not register a battle when a team1 player does not exist', async () => {
    const missingPlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();
    const missingPlayerError = new ServiceError({
      reason: SEReason.NOT_FOUND,
      field: 'playerId',
      value: missingPlayerId,
      message: 'Player not found.',
    });
    (
      gameDataService.playerService.getPlayerById as jest.Mock
    ).mockImplementation(async (playerId: string) => {
      if (playerId === missingPlayerId) return [null, [missingPlayerError]];

      return [{ _id: playerId } as any, null];
    });

    const result = await gameDataService.registerBattle(
      {
        gameType: GameType.CASUAL,
        team1: [missingPlayerId],
        team2: [team2PlayerId],
      },
      missingPlayerId,
    );

    expect(result).toBeInstanceOf(ServiceError);
    expect(result).toMatchObject({
      reason: SEReason.NOT_FOUND,
      message: 'One or more players in team 1 do not exist',
    });
    expect(await gameDataModel.countDocuments()).toBe(0);
  });

  it('Should not register a battle when a team2 player does not exist', async () => {
    const team1PlayerId = new Types.ObjectId().toHexString();
    const missingPlayerId = new Types.ObjectId().toHexString();
    const missingPlayerError = new ServiceError({
      reason: SEReason.NOT_FOUND,
      field: 'playerId',
      value: missingPlayerId,
      message: 'Player not found.',
    });
    (
      gameDataService.playerService.getPlayerById as jest.Mock
    ).mockImplementation(async (playerId: string) => {
      if (playerId === missingPlayerId) return [null, [missingPlayerError]];

      return [{ _id: playerId } as any, null];
    });

    const result = await gameDataService.registerBattle(
      {
        gameType: GameType.CASUAL,
        team1: [team1PlayerId],
        team2: [missingPlayerId],
      },
      team1PlayerId,
    );

    expect(result).toBeInstanceOf(ServiceError);
    expect(result).toMatchObject({
      reason: SEReason.NOT_FOUND,
      message: 'One or more players in team 2 do not exist',
    });
    expect(await gameDataModel.countDocuments()).toBe(0);
  });

  it('Should generate a matchId for a casual battle registered without matchId', async () => {
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();

    const result = await gameDataService.registerBattle(
      {
        gameType: GameType.CASUAL,
        team1: [team1PlayerId],
        team2: [team2PlayerId],
      },
      team1PlayerId,
    );

    expect(result).not.toBeInstanceOf(ServiceError);
    const battle = result as Exclude<typeof result, ServiceError>;
    expect(Types.ObjectId.isValid(battle._id.toString())).toBe(true);
    expect(battle.gameType).toBe(GameType.CASUAL);
    expect(await gameDataModel.findById(battle._id)).not.toBeNull();
  });

  it('Should only persist battle start fields explicitly supported by the schema', async () => {
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();

    const result = await gameDataService.registerBattle(
      {
        gameType: GameType.CUSTOM,
        team1: [team1PlayerId],
        team2: [team2PlayerId],
        unexpectedField: 'should-not-be-persisted',
      } as any,
      team1PlayerId,
    );

    expect(result).not.toBeInstanceOf(ServiceError);
    const battle = result as Exclude<typeof result, ServiceError>;
    const battleInDb = await gameDataModel.findById(battle._id).lean();

    expect(battleInDb).toMatchObject({
      gameType: GameType.CUSTOM,
      status: BattleStatus.OPEN,
      receivedResults: [],
    });
    expect(battleInDb).not.toHaveProperty('unexpectedField');
    expect(battleInDb).not.toHaveProperty('matchId');
  });
});
