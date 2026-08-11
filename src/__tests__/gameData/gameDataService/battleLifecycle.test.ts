import { Types } from 'mongoose';
import GameDataModule from '../modules/gameData.module';
import { GameDataService } from '../../../gameData/gameData.service';
import { Game } from '../../../gameData/game.schema';
import { GameType } from '../../../gameData/enum/gameType.enum';
import { BattleStatus } from '../../../gameData/enum/battleStatus.enum';
import ServiceError from '../../../common/service/basicService/ServiceError';

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

    const battle = await gameDataService.registerBattle({
      gameType: GameType.MATCHMAKING,
      team1: [team1PlayerId, team1SecondPlayerId],
      team2: [team2PlayerId, team2SecondPlayerId],
      matchId,
    });

    const battleInDb = await gameDataModel.findById(matchId);

    expect(battle).not.toBeInstanceOf(ServiceError);
    const battleDocument = battle as Exclude<typeof battle, ServiceError>;
    expect(battleDocument._id.toString()).toBe(matchId);
    expect(battleDocument.gameType).toBe(GameType.MATCHMAKING);
    expect(battleInDb?._id.toString()).toBe(matchId);
    expect(battleInDb?.gameType).toBe(GameType.MATCHMAKING);
    expect(battleInDb?.status).toBe(BattleStatus.OPEN);
  });

  it('Should submit a battle result by finding the battle with matchId as _id', async () => {
    const matchId = new Types.ObjectId().toHexString();
    const team1PlayerId = new Types.ObjectId().toHexString();
    const team2PlayerId = new Types.ObjectId().toHexString();

    await gameDataService.registerBattle({
      gameType: GameType.MATCHMAKING,
      team1: [team1PlayerId],
      team2: [team2PlayerId],
      matchId,
    });

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
});
