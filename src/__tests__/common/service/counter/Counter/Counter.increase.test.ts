import Counter from '../../../../../common/service/counter/Counter';
import { getNonExisting_id } from '../../../../test_utils/util/getNonExisting_id';
import ClanModule from '../../../../clan/modules/clan.module';
import ClanBuilderFactory from '../../../../clan/data/clanBuilderFactory';

describe('Counter.increase() test suite', () => {
  const clanModel = ClanModule.getClanModel();
  const counter = new Counter({
    model: clanModel,
    counterField: 'playerCount',
  });
  const clanCreateBuilder = ClanBuilderFactory.getBuilder('Clan');

  const startingValue = 10;
  const existingClan = clanCreateBuilder.setPlayerCount(startingValue).build();
  let existingClan_id: string;
  let filter: any;

  beforeEach(async () => {
    const dbResp = await clanModel.create(existingClan);
    existingClan_id = dbResp._id.toString();
    filter = { _id: existingClan_id };
  });

  it('Should increase the value by the specified amount and return true', async () => {
    const increaseAmount = 5;
    const isUpdated = await counter.increase(filter, increaseAmount);

    const dbObject = await clanModel.findById(existingClan_id);
    const expectedValue = startingValue + increaseAmount;

    expect(isUpdated).toBeTruthy();
    expect(dbObject.playerCount).toBe(expectedValue);
  });

  it('Should use the absolute value of the specified amount and still increase the value', async () => {
    const negativeIncreaseAmount = -3;
    const isUpdated = await counter.increase(filter, negativeIncreaseAmount);

    const dbObject = await clanModel.findById(existingClan_id);
    const expectedValue = startingValue + Math.abs(negativeIncreaseAmount);

    expect(isUpdated).toBeTruthy();
    expect(dbObject.playerCount).toBe(expectedValue);
  });

  it('Should return false if the object does not exist in DB', async () => {
    const increaseAmount = 3;
    const nonExisting_id = getNonExisting_id();
    const isUpdated = await counter.increase(
      { _id: nonExisting_id },
      increaseAmount,
    );

    expect(isUpdated).toBeFalsy();
  });
});
