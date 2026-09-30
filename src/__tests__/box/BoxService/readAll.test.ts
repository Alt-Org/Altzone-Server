import { BoxService } from '../../../box/box.service';
import BoxBuilderFactory from '../data/boxBuilderFactory';
import { ObjectId } from 'mongodb';
import BoxModule from '../modules/box.module';
import ProfileBuilderFactory from '../../../__tests__/profile/data/profileBuilderFactory';
import PlayerBuilderFactory from '../../../__tests__/player/data/playerBuilderFactory';
import ProfileModule from '../../profile/modules/profile.module';
import PlayerModule from '../../player/modules/player.module';

describe('BoxService.readAll() test suite', () => {
  let boxService: BoxService;

  const admin1 = 'box-admin1';
  const admin2 = 'box-admin2';
  const name1 = 'admin1';
  const name2 = 'admin2';

  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const profileModel = ProfileModule.getProfileModel();
  const adminProfile1 = profileBuilder
    .set_id(new ObjectId().toString())
    .setUsername(admin1)
    .build();
  const adminProfile2 = profileBuilder
    .set_id(new ObjectId().toString())
    .setUsername(admin2)
    .build();

  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const playerModel = PlayerModule.getPlayerModel();
  const adminPlayer1 = playerBuilder
    .setName(name1)
    .setUniqueIdentifier('1')
    .build();
  const adminPlayer2 = playerBuilder
    .setName(name2)
    .setUniqueIdentifier('2')
    .build();

  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  const boxModel = BoxModule.getBoxModel();
  const box1 = boxBuilder.setAdminPassword(admin1).build();
  const box2 = boxBuilder.setAdminPassword(admin2).build();

  beforeEach(async () => {
    adminPlayer1.profile_id = adminProfile1._id;
    const adminPlayerResp1 = await playerModel.create(adminPlayer1);
    adminPlayer2.profile_id = adminProfile2._id;
    const adminPlayerResp2 = await playerModel.create(adminPlayer2);

    boxService = await BoxModule.getBoxService();
    box1.adminPlayer_id = new ObjectId(adminPlayerResp1._id);
    box1.adminProfile_id = new ObjectId(adminProfile1._id);
    box2.adminPlayer_id = new ObjectId(adminPlayerResp2._id);
    box2.adminProfile_id = new ObjectId(adminProfile2._id);
  });

  it('Should return array of only Admins Boxes if valid', async () => {
    const profile = await profileModel.create(adminProfile1);
    await profileModel.create(adminProfile2);

    const createdBox = await boxModel.create(box1);
    box1._id = createdBox._id;
    await boxModel.create(box2);

    const [result, errors] = await boxService.readAll({
      filter: { adminProfile_id: profile._id },
    });

    expect(errors).toBeNull();
    expect(result).toHaveLength(1);
    expect(result[0].adminProfile_id.toString()).toBe(profile._id.toString());
  });

  it('Should return ServiceError NOT_FOUND if Box not found', async () => {
    const profile = await profileModel.create(adminProfile1);

    const [result, errors] = await boxService.readAll({
      filter: { adminProfile_id: profile._id },
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
