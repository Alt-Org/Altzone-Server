import { Types } from 'mongoose';
import GameDataModule from '../modules/gameData.module';
import { GameDataService } from '../../../gameData/gameData.service';
import { Game } from '../../../gameData/game.schema';
import { GameType } from '../../../gameData/enum/gameType.enum';
import { BattleStatus } from '../../../gameData/enum/battleStatus.enum';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { JwtService } from '@nestjs/jwt';

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
        {
          _id: playerId,
          clan_id: new Types.ObjectId().toHexString(),
        } as any,
        null,
      ]);
    jest.spyOn(gameDataService.clanService, 'readOneById').mockResolvedValue([
      {
        SoulHome: {
          _id: new Types.ObjectId().toHexString(),
        },
      } as any,
      null,
    ]);
    jest
      .spyOn(gameDataService.roomService, 'readAllSoulHomeRooms')
      .mockResolvedValue([[] as any, null]);
    jest.spyOn(JwtService.prototype, 'signAsync').mockResolvedValue('token');
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
    const battleDocument = battle as any;
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

    expect(battle).not.toBeInstanceOf(ServiceError);
    expect(battle).toMatchObject({
      stealToken: 'token',
      roomIds: [],
    });
    const battleDocument = (battle as any).battleDocument;
    expect(battleDocument._id.toString()).toBe(matchId);
    expect(battleDocument.receivedResults).toHaveLength(1);
    expect(battleDocument.receivedResults[0].playerId.toString()).toBe(
      team1PlayerId,
    );
    expect(battleDocument.status).toBe(BattleStatus.OPEN);
  });

  it('Should return steal data when matching results complete the battle for a winning player', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1ClanId = new Types.ObjectId().toHexString();
    const team2ClanId = new Types.ObjectId().toHexString();
    const loserSoulHomeId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team1SecondPlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();

    jest
      .spyOn(gameDataService.playerService, 'getPlayerById')
      .mockImplementation(async (playerId: string) => [
        {
          _id: playerId,
          clan_id: playerId === team2PlayerId ? team2ClanId : team1ClanId,
        } as any,
        null,
      ]);
    jest.spyOn(gameDataService.clanService, 'readOneById').mockResolvedValue([
      {
        _id: team2ClanId,
        SoulHome: {
          _id: loserSoulHomeId,
        },
      } as any,
      null,
    ]);
    jest
      .spyOn(gameDataService.roomService, 'readAllSoulHomeRooms')
      .mockResolvedValue([[{ _id: 'room-1' }, { _id: 'room-2' }] as any, null]);
    const signAsyncSpy = jest
      .spyOn(JwtService.prototype, 'signAsync')
      .mockResolvedValue('steal-token');

    await gameDataService.registerBattle(
      {
        gameType: GameType.CASUAL,
        team1: [team1PlayerId, team1SecondPlayerId],
        team2: [team2PlayerId],
        matchId,
      },
      team1PlayerId,
    );

    const firstResult = await gameDataService.handleBattleResult(
      {
        matchId,
        duration: 120,
        result: 1,
      } as any,
      team1PlayerId,
    );
    const completedResult = await gameDataService.handleBattleResult(
      {
        matchId,
        duration: 115,
        result: 1,
      } as any,
      team1SecondPlayerId,
    );

    expect(firstResult).not.toBeInstanceOf(ServiceError);
    expect(firstResult).toMatchObject({
      stealToken: 'steal-token',
      soulHome_id: loserSoulHomeId,
      roomIds: ['room-1', 'room-2'],
    });
    expect(completedResult).not.toBeInstanceOf(ServiceError);
    expect(completedResult).toMatchObject({
      stealToken: 'steal-token',
      soulHome_id: loserSoulHomeId,
      roomIds: ['room-1', 'room-2'],
    });
    expect((completedResult as any).battleDocument.status).toBe(
      BattleStatus.COMPLETED,
    );
    expect((completedResult as any).battleDocument.finalWinner).toBe(1);
    expect(signAsyncSpy).toHaveBeenNthCalledWith(
      1,
      {
        playerId: team1PlayerId,
        soulHomeId: loserSoulHomeId,
      },
      { expiresIn: '15m' },
    );
    expect(signAsyncSpy).toHaveBeenNthCalledWith(
      2,
      {
        playerId: team1SecondPlayerId,
        soulHomeId: loserSoulHomeId,
      },
      { expiresIn: '15m' },
    );
  });

  it('Should return steal data when a losing player completes the battle', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1ClanId = new Types.ObjectId().toHexString();
    const team2ClanId = new Types.ObjectId().toHexString();
    const loserSoulHomeId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();

    jest
      .spyOn(gameDataService.playerService, 'getPlayerById')
      .mockImplementation(async (playerId: string) => [
        {
          _id: playerId,
          clan_id: playerId === team2PlayerId ? team2ClanId : team1ClanId,
        } as any,
        null,
      ]);
    jest.spyOn(gameDataService.clanService, 'readOneById').mockResolvedValue([
      {
        _id: team2ClanId,
        SoulHome: {
          _id: loserSoulHomeId,
        },
      } as any,
      null,
    ]);
    jest
      .spyOn(gameDataService.roomService, 'readAllSoulHomeRooms')
      .mockResolvedValue([[{ _id: 'room-1' }] as any, null]);
    const signAsyncSpy = jest
      .spyOn(JwtService.prototype, 'signAsync')
      .mockResolvedValue('token');

    await gameDataService.registerBattle(
      {
        gameType: GameType.CASUAL,
        team1: [team1PlayerId],
        team2: [team2PlayerId],
        matchId,
      },
      team1PlayerId,
    );

    await gameDataService.handleBattleResult(
      {
        matchId,
        duration: 120,
        result: 1,
      } as any,
      team1PlayerId,
    );
    const losingPlayerResult = await gameDataService.handleBattleResult(
      {
        matchId,
        duration: 120,
        result: 1,
      } as any,
      team2PlayerId,
    );
    expect(losingPlayerResult).toMatchObject({
      stealToken: 'token',
      soulHome_id: loserSoulHomeId,
      roomIds: ['room-1'],
    });
    expect((losingPlayerResult as any).battleDocument.status).toBe(
      BattleStatus.COMPLETED,
    );
    expect(signAsyncSpy).toHaveBeenCalledWith(
      {
        playerId: team1PlayerId,
        soulHomeId: loserSoulHomeId,
      },
      { expiresIn: '15m' },
    );
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

  it('Should reject steal data request for a completed battle when the player has not submitted a result', async () => {
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
      field: 'playerId',
      value: team1PlayerId,
      message: 'Player must submit a result before receiving steal data.',
    });
    expect(battleInDb?.receivedResults).toHaveLength(0);
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
