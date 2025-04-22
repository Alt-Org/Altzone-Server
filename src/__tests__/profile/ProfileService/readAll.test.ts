import { ProfileService } from '../../../profile/profile.service';
import ProfileBuilderFactory from '../data/profileBuilderFactory';
import ProfileModule from '../modules/profile.module';

describe('ProfileService.readAll() test suite', () => {
  let profileService: ProfileService;
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const username1 = 'user1';
  const username2 = 'user2';

  const profileModel = ProfileModule.getProfileModel();

  beforeEach(async () => {
    await profileModel.deleteMany({});
    profileService = await ProfileModule.getProfileService();

    const profileToCreate1 = profileBuilder.setUsername(username1).build();
    await profileModel.create(profileToCreate1);

    const profileToCreate2 = profileBuilder.setUsername(username2).build();
    await profileModel.create(profileToCreate2);
  });

  it('Should retrieve all profiles based on query filter', async () => {
    const query = { filter: { username: 'user1' } } as any;
    const resp = await profileService.readAll(query);

    const foundProfiles = resp['data']['Profile'];

    expect(foundProfiles).toHaveLength(1);
    expect(foundProfiles[0]).toEqual(
      expect.objectContaining({ username: 'user1' }),
    );
  });

  it('Should retrieve return exactly one profile if limit set to 1', async () => {
    const query = { filter: undefined, select: undefined, limit: 1 } as any;
    const resp = await profileService.readAll(query);

    const foundProfiles = resp['data']['Profile'];

    expect(foundProfiles).toHaveLength(1);
  });

  it('Should retrieve all profiles if no filter is specified', async () => {
    const query = { filter: undefined, select: undefined } as any;
    const resp = await profileService.readAll(query);
    const foundProfiles = resp['data']['Profile'];

    expect(foundProfiles).toHaveLength(2);
  });

  it('Should return an empty array if select is null', async () => {
    const query = { select: null } as any;
    const resp = await profileService.readAll(query);
    const foundProfiles = resp['data']['Profile'];

    expect(foundProfiles).toHaveLength(0);
  });

  it('Should return empty response if no profiles match the filter', async () => {
    const query = { filter: { username: 'non-existent' } } as any;
    const resp = await profileService.readAll(query);
    const foundProfiles = resp['data']['Profile'];

    expect(foundProfiles).toHaveLength(0);
  });
});
