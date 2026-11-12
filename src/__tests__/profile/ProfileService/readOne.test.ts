import { ProfileService } from '../../../profile/profile.service';
import ProfileBuilderFactory from '../data/profileBuilderFactory';
import ProfileModule from '../modules/profile.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';

describe('ProfileService.readOne() test suite', () => {
  let profileService: ProfileService;
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const profileModel = ProfileModule.getProfileModel();
  const profileToCreate = profileBuilder.build();

  beforeEach(async () => {
    profileService = await ProfileModule.getProfileService();
  });

  it('Should find existing profile from DB', async () => {
    const profileResp = await profileModel.create(profileToCreate);

    const [result, errors] = await profileService.readOne({
      filter: { _id: profileResp._id } 
    });

    expect(errors).toBeNull();
    expect(result._id.toString()).toBe(profileResp._id.toString());
  });

  it('Should return null for non-existing profile and error to be VALIDATION error', async () => {
    const [result, errors] = await profileService.readOne({
      filter: { _id: getNonExisting_id() } 
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_VALIDATION();
  });
});
