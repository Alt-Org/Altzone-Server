import { JoinService } from '../../../../clan/join/join.service';
import ClanBuilderFactory from '../../data/clanBuilderFactory';
import ClanModule from '../../modules/clan.module';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MemberClanRole } from '../../../../clan/role/initializationClanRoles';
import MQTTConnector from '../../../../common/service/notificator/MQTTConnector';

jest.mock('../../../../common/service/notificator/MQTTConnector', () => ({
  getInstance: jest.fn(),
}));

describe('JoinService.handleJoinRequest() test suite', () => {
  let joinService: JoinService;
  let publishMock: jest.Mock;
  const joinBuilder = ClanBuilderFactory.getBuilder('JoinRequestDto');

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const openClan = clanBuilder.setIsOpen(true).setName('openClan').build();
  const closedClan = clanBuilder
    .setIsOpen(false)
    .setName('closedClan')
    .setPassword('password')
    .build();

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
    const clanResp1 = await clanModel.create(openClan);
    openClan._id = clanResp1._id.toString();

    const clanResp2 = await clanModel.create(closedClan);
    closedClan._id = clanResp2._id.toString();

    joinService = await ClanModule.getJoinService();
  });

  it(`Should set clan role for the joined player to ${MemberClanRole.name}`, async () => {
    const joinToCreate = joinBuilder.setClanId(openClan._id).build();

    const [clanDto, error] = await joinService.handleJoinRequest(
      joinToCreate.clan_id,
      player._id,
    );

    const clanInDB = await clanModel.findById(openClan._id);
    const memberRole = clanInDB.roles.find(
      (role) => role.name === MemberClanRole.name,
    );

    const playerInDB = await playerModel.findById(player._id);

    expect(playerInDB.clanRole_id.toString()).toBe(memberRole._id.toString());
    expect(clanDto).toBeDefined();
    expect(error).toBeNull();
    expect(clanDto.name).toBe(openClan.name);
  });

  it('Should throw NotFoundException if clan with that _id does not exists', async () => {
    const nonExisting_id = getNonExisting_id();
    const joinToCreate = joinBuilder.setClanId(nonExisting_id).build();

    await expect(
      joinService.handleJoinRequest(joinToCreate.clan_id, player._id),
    ).rejects.toThrow(NotFoundException);
  });

  it('Should throw NotFoundException if player with that _id does not exists', async () => {
    const nonExisting_id = getNonExisting_id();
    const joinToCreate = joinBuilder.setClanId(openClan._id).build();

    await expect(
      joinService.handleJoinRequest(joinToCreate.clan_id, nonExisting_id),
    ).rejects.toThrow(NotFoundException);
  });

  it('Should throw BadRequestException if join request to closed clan is without password', async () => {
    const joinToCreate = joinBuilder
      .setClanId(closedClan._id)
      .setPassword(undefined)
      .build();

    await expect(
      joinService.handleJoinRequest(
        joinToCreate.clan_id,
        player._id,
        joinToCreate.password,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('Should throw BadRequestException if join request to closed clan is with wrong password', async () => {
    const joinToCreate = joinBuilder
      .setClanId(closedClan._id)
      .setPassword('NotCorrectPasSWurD')
      .build();

    await expect(
      joinService.handleJoinRequest(
        joinToCreate.clan_id,
        player._id,
        joinToCreate.password,
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('Should remove clan if the last player of it make a join request to another open clan', async () => {
    const oldClanToCreate = clanBuilder
      .setName('oldClan')
      .setPlayerCount(1)
      .build();
    const oldClan = await clanModel.create(oldClanToCreate);
    await playerModel.updateOne({ _id: player._id }, { clan_id: oldClan._id });

    const joinToCreate = joinBuilder.setClanId(openClan._id).build();
    await joinService.handleJoinRequest(joinToCreate.clan_id, player._id);

    const oldClanInDB = await clanModel.findById(oldClan._id);

    expect(oldClanInDB).toBeNull();
  });

  it('Should decrease playerCount field of an open clan if player joins another clan', async () => {
    const oldClanToCreate = clanBuilder
      .setName('oldClan')
      .setPlayerCount(2)
      .build();
    const oldClan = await clanModel.create(oldClanToCreate);
    await playerModel.updateOne({ _id: player._id }, { clan_id: oldClan._id });
    const anotherClanMember = playerBuilder
      .setClanId(oldClan._id)
      .setName('player2')
      .setUniqueIdentifier('player2')
      .build();
    await playerModel.create(anotherClanMember);

    const joinToCreate = joinBuilder.setClanId(openClan._id).build();
    await joinService.handleJoinRequest(joinToCreate.clan_id, player._id);

    const oldClanInDB = await clanModel.findById(oldClan._id);

    expect(oldClanInDB.playerCount).toBe(1);
  });

  it('Should create a new Expedition clan if all existing open clans are full', async () => {
    await clanModel.deleteMany({});

    const fullClan = clanBuilder
      .setIsOpen(true)
      .setPlayerCount(30)
      .setName('Full')
      .build();
    await clanModel.create(fullClan);

    const newPlayer = await playerModel.create(playerBuilder.build());

    await joinService.findClanForNewPlayer(newPlayer._id.toString());

    const createdClan = await clanModel.findOne({
      name: { $regex: /Expedition/i },
    });

    expect(createdClan).not.toBeNull();
    expect(createdClan.name).toMatch(/Expedition/);
  });

  it('Should publish an MQTT join notification when player joins the clan', async () => {
    const joinToCreate = joinBuilder.setClanId(openClan._id).build();

    await joinService.handleJoinRequest(
      joinToCreate.clan_id,
      player._id,
    );

    expect(publishMock).toHaveBeenCalledTimes(1);
    const [topic, payload] = publishMock.mock.calls[0];
    expect(topic).toBe(`/clan/${openClan._id}/member/join/new`);

    const parsedPayload = JSON.parse(payload);
    expect(parsedPayload.topic).toBe(`/clan/${openClan._id}/member/join`);
    expect(parsedPayload.playerId).toBe(player._id);
    expect(parsedPayload.event).toBe('join');
    expect(parsedPayload.ts).toBeLessThanOrEqual(Date.now());
  });
});
