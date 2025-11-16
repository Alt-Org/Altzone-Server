import { JoinService } from '../../../../clan/join/join.service';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import PlayerModule from '../../../player/modules/player.module';
import ClanBuilderFactory from '../../data/clanBuilderFactory';
import ClanModule from '../../modules/clan.module';

describe('JoinService.findClanForNewPlayer() test suite', () => {
  let joinService: JoinService;

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clan = clanBuilder.setPlayerCount(1).setIsOpen(true).build();

  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const player = playerBuilder.build();

  beforeEach(async () => {
    joinService = await ClanModule.getJoinService();
  });

  it('should join player to clan if open clan with room is found', async () => {
    const playerResp = await playerModel.create(player);
    player._id = playerResp._id.toString();
    const clanResp = await clanModel.create(clan);
    clan._id = clanResp._id.toString();

    await joinService.findClanForNewPlayer(player._id);

    const updatedPlayer = await playerModel.findById(player._id);
    expect(updatedPlayer.clan_id.toString()).toEqual(clan._id);
  });

  it('should not join player to clan if no open clan with room is found', async () => {
    const playerResp = await playerModel.create(player);
    player._id = playerResp._id.toString();

    await joinService.findClanForNewPlayer(player._id);

    const updatedPlayer = await playerModel.findById(player._id);
    expect(updatedPlayer.clan_id).toBeUndefined();
  });
});
