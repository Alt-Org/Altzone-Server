import Counter from '../../../../../common/service/counter/Counter';
import { getNonExisting_id } from '../../../../test_utils/util/getNonExisting_id';
import ClanModule from '../../../../clan/modules/clan.module';
import ClanBuilderFactory from '../../../../clan/data/clanBuilderFactory';

describe('Counter.increaseOnOne() test suite', () => {
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

  it('Should increase the value by 1 and return true', async () => {
    const isUpdated = await counter.increaseOnOne(filter);

    const dbObject = await clanModel.findById(existingClan_id);
    const expectedValue = startingValue + 1;

    expect(isUpdated).toBeTruthy();
    expect(dbObject.playerCount).toBe(expectedValue);
  });

  it('Should return false if the object does not exist in DB', async () => {
    const nonExistingFilter = { _id: getNonExisting_id() };
    const isUpdated = await counter.increaseOnOne(nonExistingFilter);

    expect(isUpdated).toBeFalsy();
  });
});
