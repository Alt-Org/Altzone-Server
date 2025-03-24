import { ProfileService } from '../../../profile/profile.service';
import ProfileModule from '../modules/profile.module';
import ProfileBuilderFactory from '../data/profileBuilderFactory';
import { MongooseError } from 'mongoose';
import { MongoServerError } from 'mongodb';

describe('ProfileService.createOne() test suite', () => {
  let profileService: ProfileService;
  const profileBuilder = ProfileBuilderFactory.getBuilder('CreateProfileDto');

  const profileModel = ProfileModule.getProfileModel();

  beforeEach(async () => {
    profileService = await ProfileModule.getProfileService();
  });

  it('Should create a profile in DB if input is valid', async () => {
    const profileUsername = 'user1';
    const profileToCreate = profileBuilder.setUsername(profileUsername).build();

    await profileService.createOne(profileToCreate);

    const dbData = await profileModel.findOne({ username: profileUsername });

    expect(dbData).toEqual(expect.objectContaining(profileToCreate));
  });

  it('Should return response in appropriate shape', async () => {
    const profileUsername = 'user1';
    const profileToCreate = profileBuilder
      .setUsername(profileUsername)
      .setPlayer(null)
      .build();

    const resp = await profileService.createOne(profileToCreate);

    const data = resp['data']['Profile'].toObject();
    expect(data).toEqual(expect.objectContaining(profileToCreate));

    expect(resp['metaData']).toEqual({
      dataKey: 'Profile',
      modelName: 'Profile',
      dataType: 'Object',
      dataCount: 1,
    });
  });

  it('Should not create profile in DB if input is invalid', async () => {
    const invalidProfile = { username: false };

    try {
      await profileService.createOne(invalidProfile);
    } catch (e) {
      void e;
    }

    const dbData1 = await profileModel.findOne({ username: false });
    const dbData2 = await profileModel.findOne({ username: 'false' });

    expect(dbData1).toBeNull();
    expect(dbData2).toBeNull();
  });

  it('Should throw validation error if input is not valid', async () => {
    const invalidProfile = { username: false };

    await expect(profileService.createOne(invalidProfile)).rejects.toThrow(
      MongooseError,
    );
  });

  it('Should throw Mongoose not unique error if profile with such username already exists', async () => {
    const profileUsername = 'user1';
    const profileToCreate = profileBuilder
      .setUsername(profileUsername)
      .setPlayer(null)
      .build();

    await profileService.createOne(profileToCreate);

    try {
      await profileService.createOne(profileToCreate);
    } catch (e: any) {
      expect(e).toBeInstanceOf(MongoServerError);
      expect(e.code).toBe(11000);
    }
  });

  it('Should not create profile if profile with such username already exists', async () => {
    const profileUsername = 'user1';
    const profileToCreate = profileBuilder
      .setUsername(profileUsername)
      .setPlayer(null)
      .build();

    await profileService.createOne(profileToCreate);
    const { _id: _idBefore } = await profileModel.findOne({
      username: profileUsername,
    });

    try {
      await profileService.createOne(profileToCreate);
    } catch (e: any) {
      void e;
    }

    const { _id: _idAfter } = await profileModel.findOne({
      username: profileUsername,
    });

    expect(_idBefore.toString()).toBe(_idAfter.toString());
  });
});
