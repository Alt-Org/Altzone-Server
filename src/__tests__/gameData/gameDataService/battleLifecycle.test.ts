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
  let matchmakingService: {
    validateBattleStart: jest.Mock;
  };

  beforeEach(async () => {
    await gameDataModel.deleteMany({});
    gameDataService = await GameDataModule.getGameDataService();
    matchmakingService = {
      validateBattleStart: jest.fn(async () => null),
    };
    (
      gameDataService as unknown as {
        matchmakingService: typeof matchmakingService;
      }
    ).matchmakingService = matchmakingService;
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
        gameType: GameType.MATCHMAKING,
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
    expect(battleDocument.gameType).toBe(GameType.MATCHMAKING);
    expect(battleInDb?._id.toString()).toBe(matchId);
    expect(battleInDb?.gameType).toBe(GameType.MATCHMAKING);
    expect(battleInDb?.status).toBe(BattleStatus.OPEN);
    expect(matchmakingService.validateBattleStart).toHaveBeenCalledWith(
      matchId,
      team1PlayerId,
      [team1PlayerId, team1SecondPlayerId],
      [team2PlayerId, team2SecondPlayerId],
    );
  });

  it('Should submit a battle result by finding the battle with matchId as _id', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();

    await gameDataService.registerBattle(
      {
        gameType: GameType.MATCHMAKING,
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

    expect(battle._id.toString()).toBe(matchId);
    expect(battle.receivedResults).toHaveLength(1);
    expect(battle.receivedResults[0].playerId.toString()).toBe(team1PlayerId);
    expect(battle.status).toBe(BattleStatus.OPEN);
  });

  it('Should resolve a conflicting battle by document _id', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();
    const battle: Partial<Game> = {
      _id: matchId,
      gameType: GameType.MATCHMAKING,
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

  it('Should return REQUIRED error when matchmaking battle is registered without matchId', async () => {
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();

    const result = await gameDataService.registerBattle(
      {
        gameType: GameType.MATCHMAKING,
        team1: [team1PlayerId],
        team2: [team2PlayerId],
      },
      team1PlayerId,
    );

    expect(result).toBeInstanceOf(ServiceError);
    expect(result).toMatchObject({
      reason: SEReason.REQUIRED,
      field: 'matchId',
      message: 'Matchmaking battles require matchId.',
    });
    expect(matchmakingService.validateBattleStart).not.toHaveBeenCalled();
    expect(await gameDataModel.countDocuments()).toBe(0);
  });

  it('Should not register a matchmaking battle when matchmaking validation fails', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();
    const validationError = new ServiceError({
      reason: SEReason.VALIDATION,
      field: 'teams',
      message: 'Battle teams must match the active matchmaking match teams.',
    });
    matchmakingService.validateBattleStart.mockResolvedValueOnce([
      validationError,
    ]);

    const result = await gameDataService.registerBattle(
      {
        gameType: GameType.MATCHMAKING,
        team1: [team1PlayerId],
        team2: [team2PlayerId],
        matchId,
      },
      team1PlayerId,
    );

    expect(result).toBe(validationError);
    expect(await gameDataModel.findById(matchId)).toBeNull();
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
