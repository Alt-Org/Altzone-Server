import { JoinService } from '../../../../clan/join/join.service';
import ClanBuilderFactory from '../../data/clanBuilderFactory';
import ClanModule from '../../modules/clan.module';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { NotFoundException } from '@nestjs/common';
import MQTTConnector from '../../../../common/service/notificator/MQTTConnector';

jest.mock('../../../../common/service/notificator/MQTTConnector', () => ({
  getInstance: jest.fn(),
}));

describe('JoinService.leaveClan() test suite', () => {
  let joinService: JoinService;
  let publishMock: jest.Mock;

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const clan = clanBuilder.setPlayerCount(1).build();

  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const player = playerBuilder.build();

  beforeEach(async () => {
    publishMock = jest.fn();
    (MQTTConnector.getInstance as jest.Mock).mockReturnValue({
      publish: publishMock,
    });

    const playerResp = await playerModel.create(player);
    player._id = playerResp._id.toString();
    const clanResp = await clanModel.create(clan);
    clan._id = clanResp._id.toString();

    await playerModel.updateOne({ _id: player._id }, { clan_id: clan._id });

    joinService = await ClanModule.getJoinService();
  });

  it('Should remove player from clan if input is valid', async () => {
    await joinService.leaveClan(player._id);

    const leftPlayer = await playerModel.findById(player._id);

    expect(leftPlayer.clan_id).toBeNull();
  });

  it('Should throw NotFoundException if clan does not exists', async () => {
    const nonExisting_id = getNonExisting_id();
    await playerModel.updateOne(
      { _id: player._id },
      { clan_id: nonExisting_id },
    );

    await expect(joinService.leaveClan(player._id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Should not remove player if clan does not exists', async () => {
    const nonExisting_id = getNonExisting_id();
    await playerModel.updateOne(
      { _id: player._id },
      { clan_id: nonExisting_id },
    );

    try {
      await joinService.leaveClan(player._id);
    } catch (e) {
      void e;
    }

    const playerInDB = await playerModel.findById(player._id);

    expect(playerInDB._id).not.toBeNull();
  });

  it('Should throw NotFoundException if player with that _id does not exists', async () => {
    const nonExisting_id = getNonExisting_id();

    await expect(joinService.leaveClan(nonExisting_id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Should remove clan if the last player leaves', async () => {
    await joinService.leaveClan(player._id);

    const clanInDB = await clanModel.findById(clan._id);

    expect(clanInDB).toBeNull();
  });

  it('Should decrease playerCount field if player leaves', async () => {
    const anotherClanMember = playerBuilder
      .setClanId(clan._id)
      .setName('player2')
      .setUniqueIdentifier('player2')
      .build();
    await playerModel.create(anotherClanMember);
    await clanModel.updateOne({ _id: clan._id }, { playerCount: 2 });

    await joinService.leaveClan(player._id);

    const clanInDB = await clanModel.findById(clan._id);

    expect(clanInDB.playerCount).toBe(1);
  });

  it('Should publish an MQTT leave notification when player leaves the clan', async () => {
    await joinService.leaveClan(player._id);

    expect(publishMock).toHaveBeenCalledTimes(1);
    const [topic, payload] = publishMock.mock.calls[0];
    expect(topic).toBe(`/clan/${clan._id}/member/leave/update`);

    const parsedPayload = JSON.parse(payload);
    expect(parsedPayload.topic).toBe(`/clan/${clan._id}/member/leave`);
    expect(parsedPayload.playerId).toBe(player._id);
    expect(parsedPayload.event).toBe('leave');
    expect(parsedPayload.ts).toBeLessThanOrEqual(Date.now());
  });
});
