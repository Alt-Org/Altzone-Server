import { JoinService } from '../../../../clan/join/join.service';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import PlayerModule from '../../../player/modules/player.module';
import ClanBuilderFactory from '../../data/clanBuilderFactory';
import ClanModule from '../../modules/clan.module';
import MQTTConnector from '../../../../common/service/notificator/MQTTConnector';

jest.mock('../../../../common/service/notificator/MQTTConnector', () => ({
  getInstance: jest.fn(),
}));

describe('JoinService.findClanForNewPlayer() test suite', () => {
  let joinService: JoinService;
  let publishMock: jest.Mock;

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clan = clanBuilder.setPlayerCount(1).setIsOpen(true).build();

  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const player = playerBuilder.build();

  beforeEach(async () => {
    publishMock = jest.fn();
    (MQTTConnector.getInstance as jest.Mock).mockReturnValue({
      publish: publishMock,
    });
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

    expect(publishMock).toHaveBeenCalledTimes(1);
    const [topic, payload] = publishMock.mock.calls[0];
    expect(topic).toBe(`/clan/${clan._id}/member/join/new`);
    const parsedPayload = JSON.parse(payload);
    expect(parsedPayload.topic).toBe(`/clan/${clan._id}/member/join`);
    expect(parsedPayload.playerId).toBe(player._id);
    expect(parsedPayload.event).toBe('join');
  });

  it('should create an AUTO clan and join the player if no open clan with room is found', async () => {
    const playerResp = await playerModel.create(player);
    player._id = playerResp._id.toString();

    await joinService.findClanForNewPlayer(player._id);

    const updatedPlayer = await playerModel.findById(player._id);
    expect(updatedPlayer.clan_id).toBeDefined();
    const clan = await clanModel.findById(updatedPlayer.clan_id);
    expect(clan.tag).toBe('AUTO');

    expect(publishMock).toHaveBeenCalledTimes(1);
    const [topic, payload] = publishMock.mock.calls[0];
    expect(topic).toBe(`/clan/${clan._id}/member/join/new`);
    const parsedPayload = JSON.parse(payload);
    expect(parsedPayload.topic).toBe(`/clan/${clan._id}/member/join`);
    expect(parsedPayload.playerId).toBe(player._id);
    expect(parsedPayload.event).toBe('join');
  });
});
