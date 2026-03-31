import { ProfileService } from "src/profile/profile.service";
import ProfileModule from "../modules/profile.module";
import ProfileBuilderFactory from "../data/profileBuilderFactory";
import { Profile } from "src/profile/profile.schema";
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';

describe('ProfileService.updateProfileById() test suite', () => {
  let profileService: ProfileService;
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  let existingProfile: Profile;

  const profileModel = ProfileModule.getProfileModel();
  
  beforeEach(async () => {
    profileService = await ProfileModule.getProfileService();
    const profileToCreate = profileBuilder.build();
    const profileResp = await profileModel.create(profileToCreate);
    existingProfile = profileResp.toObject();
  });

  it('Should succesfully update an existing profile', async () => {
    const _id = existingProfile._id;
    const updateData = { 
      _id: existingProfile._id, 
      username: 'newUsername',
    };
    const resp = await profileService.updateProfileById(_id, updateData);
  
    expect(resp).toBeTruthy();

    const updatedProfile = await profileModel.findById(existingProfile._id);
    expect(updatedProfile.username).toBe(updateData.username);
  });

  it('Should return NOT_UNIQUE ServiceErrors if profile with name already exists', async () => {
    const anotherProfileData = profileBuilder
      .setUsername('anotherUsername')
      .build();
    await profileModel.create(anotherProfileData);

    const _id = existingProfile._id;
    const updateData = {
      _id: existingProfile._id,
      username: 'anotherUsername',
    }

    const [updatedProfile, errors] = 
      await profileService.updateProfileById(_id, updateData);
  
    expect(updatedProfile).toBeNull();
    expect(errors).toContainSE_NOT_UNIQUE();
  });

  it('Should return NOT_FOUND ServiceErrors if profile is not found', async () => {
    const nonExistingId = getNonExisting_id();
    const _id = nonExistingId
    const updateData = { _id: nonExistingId, username: 'newUsername' };
    
    const [updatedProfile, errors] = 
      await profileService.updateProfileById(_id, updateData);
    
    expect(updatedProfile).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return REQUIRED if securityQuestion and no securityAnswer and vice versa', async () => {
    const _id = existingProfile._id;
    const updateOne = {
      _id: existingProfile._id, 
      securityQuestion: 'First pet\'s name',
    };
    const updateTwo = {
      _id: existingProfile._id, 
      securityAnswer: 'Rover',
    };

    const [updatedProfileOne, errorsOne] = 
      await profileService.updateProfileById(_id, updateOne);

    const [updatedProfileTwo, errorsTwo] = 
      await profileService.updateProfileById(_id, updateTwo);
  
    expect(updatedProfileOne).toBeNull();
    expect(errorsOne).toContainSE_REQUIRED();

    expect(updatedProfileTwo).toBeNull();
    expect(errorsTwo).toContainSE_REQUIRED();
  });
});
