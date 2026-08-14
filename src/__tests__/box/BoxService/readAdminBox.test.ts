import { BoxService } from '../../../box/box.service';
import BoxBuilderFactory from '../data/boxBuilderFactory';
import { ObjectId } from 'mongodb';
import BoxModule from '../modules/box.module';
import ProfileBuilderFactory from '../../../__tests__/profile/data/profileBuilderFactory';
import PlayerBuilderFactory from '../../../__tests__/player/data/playerBuilderFactory';
import ProfileModule from '../../profile/modules/profile.module';
import PlayerModule from '../../player/modules/player.module';

describe('BoxService.readAdminBox() test suite', () => {
  let boxService: BoxService;

  const boxAdmin = 'box-admin';
  const name = 'admin';

  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const profileModel = ProfileModule.getProfileModel();
  const adminProfile = profileBuilder.set_id((new ObjectId()).toString()).setUsername(boxAdmin).build();

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const playerModel = PlayerModule.getPlayerModel();
  const adminPlayer = playerBuilder.setName(name).build();

  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  const boxModel = BoxModule.getBoxModel();
  const existingBox = boxBuilder.setAdminPassword(boxAdmin).build();

  const credentials = {
    adminPassword: null,
    playerName: null,
  }

  beforeEach(async () => {
    credentials.adminPassword = existingBox.adminPassword;
    credentials.playerName = name;

    adminPlayer.profile_id = adminProfile._id;
    const adminPlayerResp = await playerModel.create(adminPlayer);
    
    boxService = await BoxModule.getBoxService();
    existingBox.adminPlayer_id = new ObjectId(adminPlayerResp._id);
    existingBox.adminProfile_id = new ObjectId(adminProfile._id);
  });

  it('Should return Box if valid credentials', async () => {
    await profileModel.create(adminProfile);

    const createdBox = await boxModel.create(existingBox);
    existingBox._id = createdBox._id;

    const [result, errors] = await boxService.readAdminBox(credentials);

    expect(result._id.toString()).toMatch(existingBox._id.toString());
    expect(errors).toBeNull();
  })

  it('Should return ServiceError NOT_FOUND if Player not found', async () => {
    await profileModel.create(adminProfile);

    const createdBox = await boxModel.create(existingBox);
    existingBox._id = createdBox._id;

    credentials.playerName = "NonExisting";

    const [result, errors] = await boxService.readAdminBox(credentials);

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND()
  })

  it('Should return ServiceError NOT_FOUND if Profile not found', async () => {
    const createdBox = await boxModel.create(existingBox);
    existingBox._id = createdBox._id;

    const [result, errors] = await boxService.readAdminBox(credentials);

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND()
  })

  it('Should return ServiceError NOT_FOUND if Box not found', async () => {
    await profileModel.create(adminProfile);

    const [result, errors] = await boxService.readAdminBox(credentials);

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND()
  })
});
