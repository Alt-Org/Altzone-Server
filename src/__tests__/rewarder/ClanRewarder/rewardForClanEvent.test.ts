import RewarderModule from '../modules/clanRewarder.module';
import { ClanRewarder } from '../../../rewarder/clanRewarder/clanRewarder.service';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import { Player } from '../../../player/schemas/player.schema';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import { Clan } from '../../../clan/clan.schema';
import ClanModule from '../../clan/modules/clan.module';

describe('ClanRewarder.rewardForClanEvent() test suite', () => {
  let rewarder: ClanRewarder;

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');

  let existingPlayer: Player;
  let existingClan: Clan;

  const playerModel = PlayerModule.getPlayerModel();
  const clanModel = ClanModule.getClanModel();
  let createdClan: Clan;

  beforeEach(async () => {
    await playerModel.deleteMany({});
    await clanModel.deleteMany({});

    rewarder = await RewarderModule.getClanRewarder();
    existingClan = clanBuilder.setPoints(0).setBattlePoints(30).build();
    createdClan = await clanModel.create(existingClan);
    existingPlayer = playerBuilder
      .setClanId(createdClan._id)
      .setPoints(0)
      .setBattlePoints(30)
      .build();

    const createdPlayer = await playerModel.create(existingPlayer);
    existingPlayer._id = createdPlayer._id;
  });

  it('Should update clans battles points if event type is battle_won', async () => {
    const event = 'battle_won' as any;
    const clanBefore = await clanModel.findById(createdClan._id);

    const [isSuccess, errors] = await rewarder.rewardForClanEvent(
      existingPlayer._id,
      event,
    );

    const clanAfter = await clanModel.findById(createdClan._id);
    expect(clanAfter.points).toBe(clanBefore.points);
    expect(clanAfter.battlePoints).toBe(130);
    expect(isSuccess).toBe(true);
    expect(errors).toBeNull();
  });

  it('Should update clans battles points if event type is battle_lose and has enough battle points', async () => {
    clanModel.deleteMany({});
    const event = 'battle_lose' as any;

    const clanBefore = await clanModel.findById(createdClan._id);

    const [isSuccess, errors] = await rewarder.rewardForClanEvent(
      existingPlayer._id,
      event,
    );

    const clanAfter = await clanModel.findById(createdClan._id);
    expect(clanAfter.points).toBe(clanBefore.points);
    expect(clanAfter.battlePoints).toBe(10);
    expect(isSuccess).toBe(true);
    expect(errors).toBeNull();
  });

  it('Should update clans battles points if event type is battle_lose, but battle points could not be negative', async () => {
    const event = 'battle_lose' as any;
    await clanModel.deleteMany({});
    await playerModel.deleteMany({});

    existingClan = clanBuilder
      .setName('loserClan')
      .setPoints(0)
      .setBattlePoints(10)
      .build();

    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;
    existingPlayer = playerBuilder
      .setUniqueIdentifier('loserPlayer')
      .setClanId(createdClan._id)
      .setPoints(0)
      .setBattlePoints(30)
      .build();

    const createdPlayer = await playerModel.create(existingPlayer);
    existingPlayer._id = createdPlayer._id;

    const clanBefore = await clanModel.findById(existingClan._id);

    const [isSuccess, errors] = await rewarder.rewardForClanEvent(
      existingPlayer._id,
      event,
    );

    const clanAfter = await clanModel.findById(existingClan._id);
    expect(clanAfter.points).toBe(clanBefore.points);
    expect(clanAfter.battlePoints).toBe(0);
    expect(isSuccess).toBe(true);
    expect(errors).toBeNull();
  });

  it('Should not update clans battles points if event type is battle_lose and battle points is 0', async () => {
    const event = 'battle_lose' as any;
    await clanModel.deleteMany({});
    await playerModel.deleteMany({});

    existingClan = clanBuilder
      .setName('loserClan')
      .setPoints(0)
      .setBattlePoints(0)
      .build();

    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;
    existingPlayer = playerBuilder
      .setUniqueIdentifier('loserPlayer')
      .setClanId(createdClan._id)
      .setPoints(0)
      .setBattlePoints(30)
      .build();

    const createdPlayer = await playerModel.create(existingPlayer);
    existingPlayer._id = createdPlayer._id;

    const clanBefore = await clanModel.findById(existingClan._id);

    const [isSuccess, errors] = await rewarder.rewardForClanEvent(
      existingPlayer._id,
      event,
    );

    const clanAfter = await clanModel.findById(existingClan._id);
    expect(clanAfter.points).toBe(clanBefore.points);
    expect(clanAfter.battlePoints).toBe(0);
    expect(isSuccess).toBe(false);
    expect(errors).toBeNull();
  });

  it('Should not update points amount if the specified event does not exists and should return with WRONG_ENUM ServiceError', async () => {
    const event = 'Non-existing-event' as any;
    const clanBefore = await clanModel.findById(createdClan._id);

    const [isSuccess, errors] = await rewarder.rewardForClanEvent(
      existingPlayer._id,
      event,
    );

    const clanAfter = await clanModel.findById(createdClan._id);
    expect(clanAfter.battlePoints).toBe(clanBefore.battlePoints);
    expect(isSuccess).toBeNull();
    expect(errors).toContainSE_WRONG_ENUM();
    expect(errors[0].field).toBe('clanEvent');
    expect(errors[0].value).toBe(event);
  });

  it('Should return with ServiceError if the player does not have a clan_id', async () => {
    const event = 'battle_lose' as any;
    await clanModel.deleteMany({});
    await playerModel.deleteMany({});

    existingClan = clanBuilder
      .setName('loserClan')
      .setPoints(0)
      .setBattlePoints(0)
      .build();

    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;
    existingPlayer = playerBuilder
      .setUniqueIdentifier('loserPlayer')
      .setClanId(null)
      .setPoints(0)
      .setBattlePoints(30)
      .build();

    const createdPlayer = await playerModel.create(existingPlayer);
    existingPlayer._id = createdPlayer._id;

    const clanBefore = await clanModel.findById(existingClan._id);

    const [isSuccess, errors] = await rewarder.rewardForClanEvent(
      existingPlayer._id,
      event,
    );

    const clanAfter = await clanModel.findById(existingClan._id);
    expect(clanAfter.points).toBe(clanBefore.points);
    expect(clanAfter.battlePoints).toBe(0);
    expect(isSuccess).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
    expect(errors[0].message).toBe('Player does not belong to a clan');
    expect(errors[0].field).toBe('clan_id');
  });
});
