import { Types } from 'mongoose';
import { BattleStatus } from '../../../gameData/enum/battleStatus.enum';
import { GameType } from '../../../gameData/enum/gameType.enum';
import { GameDocument } from '../../../gameData/game.schema';
import { GameDataService } from '../../../gameData/gameData.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import GameDataModule from '../modules/gameData.module';

describe('GameDataService battle rewards integration', () => {
  const gameModel = GameDataModule.getGameModel();
  let gameDataService: GameDataService;

  const rewardCompletedBattle = (battle: GameDocument) =>
    (
      gameDataService as unknown as {
        rewardCompletedBattle: (battle: GameDocument) => Promise<boolean>;
      }
    ).rewardCompletedBattle(battle);

  beforeEach(async () => {
    gameDataService = await GameDataModule.getGameDataService();
    await Promise.all([
      gameModel.deleteMany({}),
      gameDataService.playerService.model.deleteMany({}),
      gameDataService.clanService.model.deleteMany({}),
    ]);
  });

  it.each([
    { finalWinner: 1, team1Won: true },
    { finalWinner: 2, team1Won: false },
  ])(
    'rewards every participant exactly once when team $finalWinner wins',
    async ({ finalWinner, team1Won }) => {
      const team1Clan = await gameDataService.clanService.model.create(
        ClanBuilderFactory.getBuilder('Clan').setBattlePoints(100).build(),
      );
      const team2Clan = await gameDataService.clanService.model.create(
        ClanBuilderFactory.getBuilder('Clan').setBattlePoints(100).build(),
      );
      const team1Player1 = await gameDataService.playerService.model.create(
        PlayerBuilderFactory.getBuilder('Player')
          .setName('teamOneA')
          .setUniqueIdentifier('battle-reward-team-1-a')
          .setClanId(team1Clan._id)
          .setBattlePoints(100)
          .build(),
      );
      const team1Player2 = await gameDataService.playerService.model.create(
        PlayerBuilderFactory.getBuilder('Player')
          .setName('teamOneB')
          .setUniqueIdentifier('battle-reward-team-1-b')
          .setClanId(team1Clan._id)
          .setBattlePoints(100)
          .build(),
      );
      const team2Player = await gameDataService.playerService.model.create(
        PlayerBuilderFactory.getBuilder('Player')
          .setName('teamTwoA')
          .setUniqueIdentifier('battle-reward-team-2-a')
          .setClanId(team2Clan._id)
          .setBattlePoints(100)
          .build(),
      );
      const battle = await gameModel.create({
        _id: new Types.ObjectId(),
        gameType: GameType.CASUAL,
        team1: [team1Player1._id, team1Player2._id],
        team2: [team2Player._id],
        status: BattleStatus.COMPLETED,
        finalWinner,
        receivedResults: [],
      });

      const results = await Promise.all([
        rewardCompletedBattle(battle),
        rewardCompletedBattle(battle),
      ]);
      const repeatedResult = await rewardCompletedBattle(battle);

      const [
        storedBattle,
        storedTeam1Player1,
        storedTeam1Player2,
        storedTeam2Player,
        storedTeam1Clan,
        storedTeam2Clan,
      ] = await Promise.all([
        gameModel.findById(battle._id).select('+isRewarded'),
        gameDataService.playerService.model.findById(team1Player1._id),
        gameDataService.playerService.model.findById(team1Player2._id),
        gameDataService.playerService.model.findById(team2Player._id),
        gameDataService.clanService.model.findById(team1Clan._id),
        gameDataService.clanService.model.findById(team2Clan._id),
      ]);

      expect(results.sort()).toEqual([false, true]);
      expect(repeatedResult).toBe(false);
      expect(storedBattle?.isRewarded).toBe(true);

      const team1PlayerPoints = team1Won ? 130 : 80;
      const team2PlayerPoints = team1Won ? 80 : 130;
      expect(storedTeam1Player1?.battlePoints).toBe(team1PlayerPoints);
      expect(storedTeam1Player2?.battlePoints).toBe(team1PlayerPoints);
      expect(storedTeam2Player?.battlePoints).toBe(team2PlayerPoints);
      expect(storedTeam1Player1?.gameStatistics.wonBattles).toBe(
        team1Won ? 1 : 0,
      );
      expect(storedTeam1Player2?.gameStatistics.wonBattles).toBe(
        team1Won ? 1 : 0,
      );
      expect(storedTeam2Player?.gameStatistics.wonBattles).toBe(
        team1Won ? 0 : 1,
      );

      expect(storedTeam1Clan?.battlePoints).toBe(team1Won ? 160 : 60);
      expect(storedTeam2Clan?.battlePoints).toBe(team1Won ? 80 : 130);
    },
  );

  it('rolls back the claim and earlier participant rewards when a later reward fails', async () => {
    const team1Clan = await gameDataService.clanService.model.create(
      ClanBuilderFactory.getBuilder('Clan').setBattlePoints(100).build(),
    );
    const team1Player = await gameDataService.playerService.model.create(
      PlayerBuilderFactory.getBuilder('Player')
        .setName('rollbackPlayer')
        .setUniqueIdentifier('battle-reward-rollback-player')
        .setClanId(team1Clan._id)
        .setBattlePoints(100)
        .build(),
    );
    const missingPlayerId = new Types.ObjectId();
    const battle = await gameModel.create({
      _id: new Types.ObjectId(),
      gameType: GameType.CASUAL,
      team1: [team1Player._id],
      team2: [missingPlayerId],
      status: BattleStatus.COMPLETED,
      finalWinner: 1,
      receivedResults: [],
    });

    await expect(rewardCompletedBattle(battle)).rejects.toThrow(
      `Failed to apply battle rewards for player ${missingPlayerId.toString()}`,
    );

    const [storedBattle, storedPlayer, storedClan] = await Promise.all([
      gameModel.findById(battle._id).select('+isRewarded'),
      gameDataService.playerService.model.findById(team1Player._id),
      gameDataService.clanService.model.findById(team1Clan._id),
    ]);

    expect(storedBattle?.isRewarded).toBe(false);
    expect(storedPlayer?.battlePoints).toBe(100);
    expect(storedPlayer?.gameStatistics.wonBattles).toBe(0);
    expect(storedClan?.battlePoints).toBe(100);
  });
});
