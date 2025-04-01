import RewarderModule from '../modules/clanRewarder.module';
import { ClanRewarder } from '../../../rewarder/clanRewarder/clanRewarder.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';

describe('ClanRewarder.rewardClanForPlayerTask() test suite', () => {
  let rewarder: ClanRewarder;
  const clanMaxPoints = 10000;

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const existingClan = clanBuilder.setPoints(0).setGameCoins(0).build();
  const clanModel = ClanModule.getClanModel();

  beforeEach(async () => {
    rewarder = await RewarderModule.getClanRewarder();

    const createdClan = await clanModel.create(existingClan);
    existingClan._id = createdClan._id;
  });

  it('Should return true and no errors if input is valid', async () => {
    const [isSuccess, errors] = await rewarder.rewardClanForPlayerTask(
      existingClan._id,
      10,
      10,
    );

    expect(errors).toBeNull();
    expect(isSuccess).toBeTruthy();
  });

  it('Should update coins amount of specified clan', async () => {
    const coinsToAdd = 10;
    const clanBefore = await clanModel.findById(existingClan._id);

    await rewarder.rewardClanForPlayerTask(existingClan._id, 1, coinsToAdd);

    const clanAfter = await clanModel.findById(existingClan._id);
    expect(clanAfter.gameCoins).toBe(clanBefore.gameCoins + coinsToAdd);
  });

  it('Should update points amount of specified clan', async () => {
    const pointsToAdd = 10;
    const clanBefore = await clanModel.findById(existingClan._id);

    await rewarder.rewardClanForPlayerTask(existingClan._id, pointsToAdd, 1);

    const clanAfter = await clanModel.findById(existingClan._id);
    expect(clanAfter.points).toBe(clanBefore.points + pointsToAdd);
  });

  it(`Should not update points amount if clan already has the max amount ${clanMaxPoints} points`, async () => {
    await clanModel.findByIdAndUpdate(existingClan._id, {
      points: clanMaxPoints,
    });
    const pointsToAdd = 10;
    const clanBefore = await clanModel.findById(existingClan._id);

    await rewarder.rewardClanForPlayerTask(existingClan._id, pointsToAdd, 1);

    const clanAfter = await clanModel.findById(existingClan._id);
    expect(clanAfter.points).toBe(clanBefore.points);
  });

  it(`Should update points amount at max til ${clanMaxPoints} points`, async () => {
    await clanModel.findByIdAndUpdate(existingClan._id, {
      points: clanMaxPoints - 5,
    });
    const pointsToAdd = 10;

    await rewarder.rewardClanForPlayerTask(existingClan._id, pointsToAdd, 1);

    const clanAfter = await clanModel.findById(existingClan._id);
    expect(clanAfter.points).toBe(clanMaxPoints);
  });

  it('Should not update points amount if the specified amount is a negative number and return LESS_THAN_MIN ServiceError', async () => {
    const pointsToAdd = -10;
    const clanBefore = await clanModel.findById(existingClan._id);

    const [isSuccess, errors] = await rewarder.rewardClanForPlayerTask(
      existingClan._id,
      pointsToAdd,
      1,
    );

    const clanAfter = await clanModel.findById(existingClan._id);
    expect(clanAfter.points).toBe(clanBefore.points);
    expect(isSuccess).toBeNull();
    expect(errors).toContainSE_LESS_THAN_MIN();
    expect(errors[0].field).toBe('points');
    expect(errors[0].value).toBe(pointsToAdd);
  });

  it('Should not update coins amount if the specified amount is a negative number and return LESS_THAN_MIN ServiceError', async () => {
    const coinsToAdd = -10;
    const clanBefore = await clanModel.findById(existingClan._id);

    const [isSuccess, errors] = await rewarder.rewardClanForPlayerTask(
      existingClan._id,
      1,
      coinsToAdd,
    );

    const clanAfter = await clanModel.findById(existingClan._id);
    expect(clanAfter.gameCoins).toBe(clanBefore.gameCoins);
    expect(isSuccess).toBeNull();
    expect(errors).toContainSE_LESS_THAN_MIN();
    expect(errors[0].field).toBe('coins');
    expect(errors[0].value).toBe(coinsToAdd);
  });

  it('Should throw ServiceError NOT_FOUND if the clan does not exists', async () => {
    try {
      await rewarder.rewardClanForPlayerTask(getNonExisting_id(), 10, 10);
    } catch (e) {
      expect(e).toContainSE_NOT_FOUND();
    }
  });
});
