import ProfileBuilderFactory from '../../../../__tests__/profile/data/profileBuilderFactory';
import BoxAuthHandler from '../../../../box/auth/BoxAuthHandler';
import BoxBuilderFactory from '../../data/boxBuilderFactory';
import BoxModule from '../../modules/box.module';
import ProfileModule from '../../../../__tests__/profile/modules/profile.module';

describe('BoxAuthHandler.getGroupAdminToken() test suite', () => {
  let boxAuthHandler: BoxAuthHandler;
  const boxUserBuilder = BoxBuilderFactory.getBuilder('BoxUser');
  const boxAdminUser = boxUserBuilder.setGroupAdmin(true).build();

  const profileModel = ProfileModule.getProfileModel();
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const profile = profileBuilder.set_id(boxAdminUser.profile_id).build();

  beforeEach(async () => {
    boxAuthHandler = await BoxModule.getBoxAuthHandler();
  });

  it('Should return access and refresh tokens and expiration times', async () => {
    await profileModel.create(profile);

    const [result, errors] = await boxAuthHandler.getGroupAdminToken(boxAdminUser);

    expect(errors).toBeNull();
    expect(result).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        tokenExpires: expect.any(Number),
        refreshToken: expect.any(String),
        refreshTokenExpires: expect.any(Number),
      }),
    );
  });

  it('Should return NOT_FOUND error when profile does not exist', async () => {
    const [result, errors] = await boxAuthHandler.getGroupAdminToken(boxAdminUser);

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
