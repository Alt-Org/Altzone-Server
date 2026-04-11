import { ProfileService } from '../../../profile/profile.service';
import ProfileModule from '../modules/profile.module';
import ProfileBuilderFactory from '../data/profileBuilderFactory';
import { CreateProfileDto } from '../../../profile/dto/createProfile.dto';
import ProfileBuilder from '../data/profile/profileBuilder';

describe('ProfileService.getSecurityQuestion() test suite', () => {
  let profileService: ProfileService;
  let profileBuilder: ProfileBuilder;

  const profileModel = ProfileModule.getProfileModel();

  beforeEach(async () => {
    profileService = await ProfileModule.getProfileService();
    profileBuilder = ProfileBuilderFactory.getBuilder('Profile');

    await profileModel.deleteMany({});
  });

  it('Should return profile securityQuestion', async () => {
    const username = 'user';
    const question = 'Favorite color?';
    const profileToCreate = profileBuilder
      .setUsername(username)
      .setSecurityQuestion(question)
      .build() as CreateProfileDto;

    await profileService.createOne(profileToCreate);

    const [securityQuestion, errors] =
      await profileService.getSecurityQuestion(username);

    expect(errors).toBeNull();

    expect(securityQuestion).not.toBeNull();
    expect(securityQuestion.securityQuestion).toBe(question);
  });

  it('Should return NOT_FOUND ServiceErrors if profile not found', async () => {
    const username = 'user';
    const username2 = 'user2';
    const profileToCreate = profileBuilder
      .setUsername(username)
      .build() as CreateProfileDto;

    await profileService.createOne(profileToCreate);

    const [securityQuestion, errors] =
      await profileService.getSecurityQuestion(username2);

    expect(securityQuestion).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return NOT_FOUND ServiceErrors if no securityQuestion', async () => {
    const username = 'user';
    const profileToCreate = profileBuilder
      .setUsername(username)
      .build() as CreateProfileDto;

    await profileService.createOne(profileToCreate);

    const [securityQuestion, errors] =
      await profileService.getSecurityQuestion(username);

    expect(securityQuestion).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
