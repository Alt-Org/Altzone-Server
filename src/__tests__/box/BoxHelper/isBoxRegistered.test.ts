import { BoxHelper } from '../../../box/util/boxHelper';
import BoxModule from '../modules/box.module';
import BoxBuilderFactory from '../data/boxBuilderFactory';
import { ObjectId } from 'mongodb';

describe('BoxHelper.isBoxRegistered() test suite', () => {
  let boxHelper: BoxHelper;
  const boxModel = BoxModule.getBoxModel();
  const boxBuilder = BoxBuilderFactory.getBuilder('Box');

  beforeEach(async () => {
    boxHelper = await BoxModule.getBoxHelper();
  });

  it('Should return true if box registered', async () => {
    const adminPassword = 'adminPassword';
    const boxToCreate = boxBuilder
      .setAdminPassword(adminPassword)
      .setAdminPlayerId(new ObjectId())
      .setAdminProfileId(new ObjectId())
      .setClanIds([])
      .setSoulHomeIds([])
      .setRoomIds([])
      .setStockIds([])
      .setChatId(new ObjectId())
      .build();

    await boxModel.create(boxToCreate);

    const isRegistered = await boxHelper.isBoxRegistered(adminPassword);
    expect(isRegistered).toBeTruthy();
  });

  it('Should return false if box is not registered', async () => {
    const isRegistered = await boxHelper.isBoxRegistered('not-registered');
    expect(isRegistered).toBeFalsy();
  });
});
