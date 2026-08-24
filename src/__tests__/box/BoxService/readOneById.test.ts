import { BoxService } from '../../../box/box.service';
import BoxBuilderFactory from '../data/boxBuilderFactory';
import { ObjectId } from 'mongodb';
import BoxModule from '../modules/box.module';
import ProfileBuilderFactory from '../../../__tests__/profile/data/profileBuilderFactory';
import PlayerBuilderFactory from '../../../__tests__/player/data/playerBuilderFactory';
import ProfileModule from '../../profile/modules/profile.module';
import PlayerModule from '../../player/modules/player.module';

describe('BoxService.readOneById() test suite', () => {
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

  beforeEach(async () => {
    await profileModel.create(adminProfile);
    adminPlayer.profile_id = adminProfile._id;
    const adminPlayerResp = await playerModel.create(adminPlayer);
    
    boxService = await BoxModule.getBoxService();
    existingBox.adminPlayer_id = new ObjectId(adminPlayerResp._id);
    existingBox.adminProfile_id = new ObjectId(adminProfile._id);
  });

  it('Should return Box if valid credentials', async () => {
    const createdBox = await boxModel.create(existingBox);

    const [result, errors] = await boxService.readOneById(createdBox._id.toString());

    expect(errors).toBeNull();
    expect(result._id.toString()).toBe(createdBox._id.toString());
  });

  it('Should return ServiceError NOT_FOUND if Box not found', async () => {
    const [result, errors] = await boxService.readOneById(adminProfile._id);
    
    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
