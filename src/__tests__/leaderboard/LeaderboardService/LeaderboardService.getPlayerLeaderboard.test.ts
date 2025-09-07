import { LeaderboardService } from '../../../leaderboard/leaderboard.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import LeaderboardModule from '../modules/leaderboard.module';
import InterfaceBuilderFactory from '../../common/interface/data/interfaceBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { Player } from '../../../player/schemas/player.schema';
import LoggedUser from '../../test_utils/const/loggedUser';

describe('LeaderboardService.getPlayerLeaderboard() test suite', () => {
  let service: LeaderboardService;
  const queryBuilder = InterfaceBuilderFactory.getBuilder('IGetAllQuery');

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const player1 = playerBuilder
    .setName('player-1')
    .setUniqueIdentifier('player-1')
    .setBattlePoints(100)
    .build();
  const player2 = playerBuilder
    .setName('player-2')
    .setUniqueIdentifier('player-2')
    .setBattlePoints(50)
    .build();
  const player3 = playerBuilder
    .setName('player-3')
    .setUniqueIdentifier('player-3')
    .setBattlePoints(10)
    .build();
  const playerModel = PlayerModule.getPlayerModel();

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clan = clanBuilder.setName('clan').setPoints(100).build();
  const clanModel = ClanModule.getClanModel();

  beforeEach(async () => {
    service = await LeaderboardModule.getLeaderboardService();

    //Remove pre-created default player
    await playerModel.deleteOne({ name: LoggedUser.getPlayer().name });

    const createdClan = await clanModel.create(clan);
    clan._id = createdClan._id;

    player1.clan_id = clan._id;
    player2.clan_id = clan._id;
    player3.clan_id = clan._id;

    await playerModel.create(player2);
    await playerModel.create(player3);
    await playerModel.create(player1);
  });

  it('Should return leading players in valid order', async () => {
    const query = queryBuilder.setLimit(10).build();

    const leaders = (await service.getPlayerLeaderboard(query)) as Player[];

    const playerNames = leaders.map((leader) => leader.name);

    expect(playerNames).toEqual([player1.name, player2.name, player3.name]);
  });

  it('Should return clanLogo data if player is in a clan', async () => {
    const query = queryBuilder.setLimit(10).build();

    const leaders = (await service.getPlayerLeaderboard(query)) as any[];

    expect(leaders[0].clanLogo).toEqual(clan.clanLogo);
  });

  it('Should return requested amount of leading players', async () => {
    const query = queryBuilder.setLimit(2).setSkip(0).build();
    const leaders = await service.getPlayerLeaderboard(query);

    expect(leaders).toHaveLength(2);
  });

  it('Should be able to skip leading players', async () => {
    const query = queryBuilder.setLimit(10).setSkip(2).build();
    const leaders = (await service.getPlayerLeaderboard(query)) as Player[];

    expect(leaders).toHaveLength(1);
    expect(leaders[0].name).toBe(player3.name);
  });
});
