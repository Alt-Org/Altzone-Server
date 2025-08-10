import ProfileModule from '../../profile/modules/profile.module';
import UniqueFieldGenerator from '../../../box/util/UniqueFieldGenerator';
import ProfileBuilder from '../../profile/data/profile/profileBuilder';
import ProfileBuilderFactory from '../../profile/data/profileBuilderFactory';
import BoxModule from '../modules/box.module';

describe('UniqueFieldGenerator.generateUniqueFieldValue() test suite', () => {
  let generator: UniqueFieldGenerator;

  const profileModel = ProfileModule.getProfileModel();
  let profileBuilder: ProfileBuilder;

  beforeEach(async () => {
    generator = await BoxModule.getUniqueFieldGenerator();
    profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  });

  it('Should return provided field value if this value is unique', async () => {
    const value = 'my-username';
    const returnedField = await generator.generateUniqueFieldValue(
      profileModel,
      'username',
      value,
    );
    expect(returnedField).toBe(value);
  });

  it('Should return provided field value with "-1" in the end if there are only one such value', async () => {
    const value = 'my-username';
    const profile = profileBuilder.setUsername(value).build();
    await profileModel.create(profile);

    const returnedField = await generator.generateUniqueFieldValue(
      profileModel,
      'username',
      value,
    );
    expect(returnedField).toBe(`${value}-1`);
  });

  it('Should return provided field value with "-2" in the end if there are one value with ending "-1"', async () => {
    const value = 'my-username';
    const existingValue = 'my-username-1';
    const profile = profileBuilder.setUsername(existingValue).build();
    await profileModel.create(profile);

    const returnedField = await generator.generateUniqueFieldValue(
      profileModel,
      'username',
      value,
    );
    expect(returnedField).toBe(`${value}-2`);
  });
});
