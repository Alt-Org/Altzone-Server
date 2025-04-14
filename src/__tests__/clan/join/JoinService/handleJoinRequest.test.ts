import { JoinService } from '../../../../clan/join/join.service';
import ClanBuilderFactory from '../../data/clanBuilderFactory';
import ClanModule from '../../modules/clan.module';
import PlayerModule from '../../../player/modules/player.module';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { ObjectId } from 'mongodb';
import { getNonExisting_id } from '../../../test_utils/util/getNonExisting_id';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MemberClanRole } from '../../../../clan/role/initializationClanRoles';

describe('JoinService.handleJoinRequest() test suite', () => {
  let joinService: JoinService;
  const joinBuilder = ClanBuilderFactory.getBuilder('JoinRequestDto');
  const joinModel = ClanModule.getJoinModel();

  const clanModel = ClanModule.getClanModel();
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const openClan = clanBuilder.setIsOpen(true).setName('openClan').build();
  const closedClan = clanBuilder.setIsOpen(false).setName('closedClan').build();

  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const player = playerBuilder.build();

  beforeEach(async () => {
    const playerResp = await playerModel.create(player);
    player._id = playerResp._id.toString();
    const clanResp1 = await clanModel.create(openClan);
    openClan._id = clanResp1._id.toString();

    const clanResp2 = await clanModel.create(closedClan);
    closedClan._id = clanResp2._id.toString();

    joinService = await ClanModule.getJoinService();
  });

  it('Should create a clan join request in DB if input is valid', async () => {
    const joinToCreate = joinBuilder
      .setClanId(closedClan._id)
      .setPlayerId(player._id)
      .build();

    await joinService.handleJoinRequest(joinToCreate);

    const dbData = await joinModel.findOne({
      clan_id: closedClan._id,
      player_id: player._id,
    });

    expect(dbData.toObject()).toMatchObject({
      ...joinToCreate,
      _id: expect.any(ObjectId),
    });
  });

  it(`Should set clan role for the joined player to ${MemberClanRole.name}`, async () => {
    const joinToCreate = joinBuilder
      .setClanId(openClan._id)
      .setPlayerId(player._id)
      .build();

    await joinService.handleJoinRequest(joinToCreate);

    const clanInDB = await clanModel.findById(openClan._id);
    const memberRole = clanInDB.roles.find(
      (role) => role.name === MemberClanRole.name,
    );

    const playerInDB = await playerModel.findById(player._id);

    expect(playerInDB.clanRole_id.toString()).toBe(memberRole._id.toString());
  });

  it('Should throw NotFoundException if clan with that _id does not exists', async () => {
    const nonExisting_id = getNonExisting_id();
    const joinToCreate = joinBuilder
      .setClanId(nonExisting_id)
      .setPlayerId(player._id)
      .build();

    await expect(joinService.handleJoinRequest(joinToCreate)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Should not create join request in DB if clan with that _id does not exists', async () => {
    const nonExisting_id = getNonExisting_id();
    const joinToCreate = joinBuilder
      .setClanId(nonExisting_id)
      .setPlayerId(player._id)
      .build();

    try {
      await joinService.handleJoinRequest(joinToCreate);
    } catch (e) {
      void e;
    }

    const dbData = await joinModel.findOne({
      clan_id: nonExisting_id,
      player_id: player._id,
    });

    expect(dbData).toBeNull();
  });

  it('Should throw NotFoundException if player with that _id does not exists', async () => {
    const nonExisting_id = getNonExisting_id();
    const joinToCreate = joinBuilder
      .setClanId(openClan._id)
      .setPlayerId(nonExisting_id)
      .build();

    await expect(joinService.handleJoinRequest(joinToCreate)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Should not create join request in DB if player with that _id does not exists', async () => {
    const nonExisting_id = getNonExisting_id();
    const joinToCreate = joinBuilder
      .setClanId(openClan._id)
      .setPlayerId(nonExisting_id)
      .build();

    try {
      await joinService.handleJoinRequest(joinToCreate);
    } catch (e) {
      void e;
    }

    const dbData = await joinModel.findOne({
      clan_id: openClan._id,
      player_id: nonExisting_id,
    });

    expect(dbData).toBeNull();
  });

  it('Should throw BadRequestException if join request to closed clan is without message', async () => {
    const joinToCreate = joinBuilder
      .setClanId(closedClan._id)
      .setPlayerId(player._id)
      .setJoinMessage(undefined)
      .build();

    await expect(joinService.handleJoinRequest(joinToCreate)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('Should not create join request in DB if join request to closed clan is without message', async () => {
    const joinToCreate = joinBuilder
      .setClanId(closedClan._id)
      .setPlayerId(player._id)
      .setJoinMessage(undefined)
      .build();

    try {
      await joinService.handleJoinRequest(joinToCreate);
    } catch (e) {
      void e;
    }

    const dbData = await joinModel.findOne({
      clan_id: openClan._id,
      player_id: player._id,
    });

    expect(dbData).toBeNull();
  });

  it('Should remove clan if the last player of it make a join request to another open clan', async () => {
    const oldClanToCreate = clanBuilder
      .setName('oldClan')
      .setPlayerCount(1)
      .build();
    const oldClan = await clanModel.create(oldClanToCreate);
    await playerModel.updateOne({ _id: player._id }, { clan_id: oldClan._id });

    const joinToCreate = joinBuilder
      .setClanId(openClan._id)
      .setPlayerId(player._id)
      .build();
    const resp = await joinService.handleJoinRequest(joinToCreate);

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

    const joinToCreate = joinBuilder
      .setClanId(openClan._id)
      .setPlayerId(player._id)
      .build();
    await joinService.handleJoinRequest(joinToCreate);

    const oldClanInDB = await clanModel.findById(oldClan._id);

    expect(oldClanInDB.playerCount).toBe(1);
  });
});
