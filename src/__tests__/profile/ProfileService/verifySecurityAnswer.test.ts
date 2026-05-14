import { ProfileService } from '../../../profile/profile.service';
import ProfileModule from '../modules/profile.module';
import ProfileBuilderFactory from '../data/profileBuilderFactory';
import { CreateProfileDto } from '../../../profile/dto/createProfile.dto';
import ProfileBuilder from '../data/profile/profileBuilder';
import { JwtService } from '@nestjs/jwt';

describe('ProfileService.verifySecurityAnswer() test suite', () => {
  const resetToken = 'reset-token';
  const tokenExpires = new Date().getTime();
  const username = 'user';
  const password = 'password';
  const question = 'Favorite color?';
  const answer = 'green';

  jest.spyOn(JwtService.prototype, 'signAsync').mockResolvedValue(resetToken);
  jest
    .spyOn(JwtService.prototype, 'decode')
    .mockReturnValue({ exp: tokenExpires });

  let profileService: ProfileService;
  let profileBuilder: ProfileBuilder;

  const profileModel = ProfileModule.getProfileModel();

  beforeEach(async () => {
    profileService = await ProfileModule.getProfileService();
    profileBuilder = ProfileBuilderFactory.getBuilder('Profile');

    await profileModel.deleteMany({});
  });

  it('Should return resetToken if answer correct', async () => {
    const profileToCreate = profileBuilder
      .setUsername(username)
      .setPassword(password)
      .setSecurityQuestion(question)
      .setSecurityAnswer(answer)
      .build() as unknown as CreateProfileDto;

    await profileService.createWithHashedPassword(profileToCreate);

    const [profileToken, errors] = await profileService.verifySecurityAnswer(
      username,
      answer,
    );

    expect(errors).toBeNull();
    expect(profileToken).not.toBeNull();
  });

  it('Should return NOT_FOUND ServiceErrors if profile not found', async () => {
    const profileToCreate = profileBuilder
      .setUsername(username)
      .setPassword(password)
      .setSecurityQuestion(question)
      .setSecurityAnswer(answer)
      .build() as unknown as CreateProfileDto;

    await profileService.createWithHashedPassword(profileToCreate);

    const [profileToken, errors] = await profileService.verifySecurityAnswer(
      'user2',
      answer,
    );

    expect(errors).not.toBeNull();

    expect(profileToken).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return NOT_ALLOWED ServiceErrors if no securityAnswer', async () => {
    const profileToCreate = profileBuilder
      .setUsername(username)
      .setPassword(password)
      .build() as unknown as CreateProfileDto;

    await profileService.createWithHashedPassword(profileToCreate);

    const [profileToken, errors] = await profileService.verifySecurityAnswer(
      username,
      answer,
    );

    expect(errors).not.toBeNull();

    expect(profileToken).toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
  });

  it('Should return NOT_ALLOWED ServiceErrors if recovery locked', async () => {
    const lockoutTime = new Date(Date.now() + 60 * 60 * 1000);

    const profileToCreate = profileBuilder
      .setUsername(username)
      .setPassword(password)
      .setSecurityQuestion(question)
      .setSecurityAnswer(answer)
      .setRecoveryLockedUntil(lockoutTime)
      .build() as unknown as CreateProfileDto;

    await profileService.createWithHashedPassword(profileToCreate);

    const [profileToken, errors] = await profileService.verifySecurityAnswer(
      username,
      answer,
    );

    expect(errors).not.toBeNull();

    expect(profileToken).toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
  });

  it('Should return NOT_ALLOWED ServiceErrors if answer does not match one in DB', async () => {
    const wrongAnswer = 'blue';

    const profileToCreate = profileBuilder
      .setUsername(username)
      .setPassword(password)
      .setSecurityQuestion(question)
      .setSecurityAnswer(answer)
      .build() as unknown as CreateProfileDto;

    await profileService.createWithHashedPassword(profileToCreate);

    const [profileToken, errors] = await profileService.verifySecurityAnswer(
      username,
      wrongAnswer,
    );

    expect(errors).not.toBeNull();

    expect(profileToken).toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
  });
});
