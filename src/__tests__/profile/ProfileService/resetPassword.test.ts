import { ProfileService } from '../../../profile/profile.service';
import ProfileModule from "../modules/profile.module";
import ProfileBuilderFactory from "../data/profileBuilderFactory";
import { CreateProfileDto } from '../../../profile/dto/createProfile.dto';
import ProfileBuilder from '../data/profile/profileBuilder';
import { JwtService } from '@nestjs/jwt';

describe('ProfileService.resetPassword() test suite', () => {
  const resetToken = 'reset-token';
  const tokenExpires = new Date().getTime();
  const username = 'user';
  const password = 'password'
  const question = 'Favorite color?';
  const answer = 'green';
  const newPassword = 'newPassword';

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

  it('Should return true if password updated successfully', async () => {
    const profileToCreate = profileBuilder
      .setUsername(username)
      .setPassword(password)
      .setSecurityQuestion(question)
      .setSecurityAnswer(answer)
      .build() as unknown as CreateProfileDto;

    await profileService.createWithHashedPassword(profileToCreate);

    const [resetToken,] = await profileService.verifySecurityAnswer(username, answer);
  
    const resp = await profileService.resetPassword(resetToken.resetToken, newPassword);

    expect(resp).toBeTruthy();
  });

  it('Should return error if invalid token', async () => {
    const invalidToken = 'invalidToken';

    const profileToCreate = profileBuilder
      .setUsername(username)
      .setPassword(password)
      .setSecurityQuestion(question)
      .setSecurityAnswer(answer)
      .build() as unknown as CreateProfileDto;

    await profileService.createWithHashedPassword(profileToCreate);

    const [resp , errors] = await profileService.resetPassword(invalidToken, newPassword);

    expect(resp).toBeNull();

    expect(errors).not.toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
  });
});
