import { TesterService } from '../../../../box/tester/tester.service';
import BoxModule from '../../modules/box.module';
import { Box } from '../../../../box/schemas/box.schema';
import ProfileModule from '../../../profile/modules/profile.module';
import PlayerModule from '../../../player/modules/player.module';
import { ObjectId } from 'mongodb';
import BoxBuilderFactory from '../../data/boxBuilderFactory';
import { PasswordGenerator } from '../../../../common/function/passwordGenerator';
import ProfileBuilderFactory from '../../../profile/data/profileBuilderFactory';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';

describe('TesterService.createTesters() test suite', () => {
  let service: TesterService;
  let passwordGenerator: PasswordGenerator;

  const boxModel = BoxModule.getBoxModel();
  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  let existingBox: Box;

  const profileModel = ProfileModule.getProfileModel();
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');

  beforeEach(async () => {
    service = await BoxModule.getTesterService();
    passwordGenerator = await BoxModule.getPasswordGenerator();

    existingBox = boxBuilder
      .setAdminPlayerId(new ObjectId())
      .setAdminProfileId(new ObjectId())
      .build();
    const boxResp = await boxModel.create(existingBox);
    existingBox._id = boxResp._id;
  });

  it('Should create specified amount of profiles in DB', async () => {
    const amount = 5;

    await service.createTesters(amount);

    const profilesInDB = await profileModel.find();

    expect(profilesInDB).toHaveLength(amount + 1);
  });

  it('Should create specified amount of players in DB', async () => {
    const amount = 5;

    await service.createTesters(amount);

    const playersInDB = await playerModel.find();

    expect(playersInDB).toHaveLength(amount + 1);
  });

  it('Should create profile in DB if there are already profiles with the generated username', async () => {
    const existingUsername1 = 'existing-username';
    const existingProfile1 = profileBuilder
      .setUsername(existingUsername1)
      .build();
    const existingUsername2 = 'existing-username-1';
    const existingProfile2 = profileBuilder
      .setUsername(existingUsername2)
      .build();
    await profileModel.create(existingProfile1);
    await profileModel.create(existingProfile2);
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(existingUsername1);

    const amount = 1;

    const profilesInDBBefore = await profileModel.find();
    await service.createTesters(amount);
    const profilesInDBAfter = await profileModel.find();

    expect(profilesInDBAfter).toHaveLength(profilesInDBBefore.length + amount);
  });

  it('Should create profile in DB if there are already one profile with the generated username', async () => {
    const existingUsername = 'existing-username';
    const existingProfile = profileBuilder
      .setUsername(existingUsername)
      .build();
    await profileModel.create(existingProfile);
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(existingUsername);

    const amount = 1;

    const profilesInDBBefore = await profileModel.find();
    await service.createTesters(amount);
    const profilesInDBAfter = await profileModel.find();

    expect(profilesInDBAfter).toHaveLength(profilesInDBBefore.length + amount);
  });

  it('Should create player in DB if there are already players with the generated name', async () => {
    const existingName1 = 'existing-name';
    const existingPlayer1 = playerBuilder
      .setName(existingName1)
      .setUniqueIdentifier(existingName1)
      .build();
    const existingName2 = 'existing-name-1';
    const existingPlayer2 = playerBuilder
      .setName(existingName2)
      .setUniqueIdentifier(existingName2)
      .build();
    await playerModel.create(existingPlayer1);
    await playerModel.create(existingPlayer2);
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(existingName1);

    const amount = 1;

    const playersInDBBefore = await playerModel.find();
    await service.createTesters(amount);
    const playersInDBAfter = await playerModel.find();

    expect(playersInDBAfter).toHaveLength(playersInDBBefore.length + amount);
  });

  it('Should create player in DB if there are already one player with the generated name', async () => {
    const existingName = 'existing-name';
    const existingPlayer = playerBuilder
      .setName(existingName)
      .setUniqueIdentifier(existingName)
      .build();
    await playerModel.create(existingPlayer);
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(existingName);

    const amount = 1;

    const playersInDBBefore = await playerModel.find();
    await service.createTesters(amount);
    const playersInDBAfter = await playerModel.find();

    expect(playersInDBAfter).toHaveLength(playersInDBBefore.length + amount);
  });

  it('Should create player in DB if there are already players with the generated uniqueIdentifier', async () => {
    const existingId1 = 'existing-name';
    const existingPlayer1 = playerBuilder
      .setName('some-name-1')
      .setUniqueIdentifier(existingId1)
      .build();
    const existingId2 = 'existing-name-1';
    const existingPlayer2 = playerBuilder
      .setName('some-name-2')
      .setUniqueIdentifier(existingId2)
      .build();
    await playerModel.create(existingPlayer1);
    await playerModel.create(existingPlayer2);
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(existingId1);

    const amount = 1;

    const playersInDBBefore = await playerModel.find();
    await service.createTesters(amount);
    const playersInDBAfter = await playerModel.find();

    expect(playersInDBAfter).toHaveLength(playersInDBBefore.length + amount);
  });

  it('Should create player in DB if there are already one player with the generated uniqueIdentifier', async () => {
    const existingId = 'existing-name';
    const existingPlayer = playerBuilder
      .setName('some-name-1')
      .setUniqueIdentifier(existingId)
      .build();
    await playerModel.create(existingPlayer);
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(existingId);

    const amount = 1;

    const playersInDBBefore = await playerModel.find();
    await service.createTesters(amount);
    const playersInDBAfter = await playerModel.find();

    expect(playersInDBAfter).toHaveLength(playersInDBBefore.length + amount);
  });

  it('Should create profiles in DB if all generated usernames are the same', async () => {
    const sameUsername = 'same-username';
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(sameUsername);
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(sameUsername);
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(sameUsername);

    const amount = 3;

    const profilesInDBBefore = await profileModel.find();
    await service.createTesters(amount);
    const profilesInDBAfter = await profileModel.find();

    expect(profilesInDBAfter).toHaveLength(profilesInDBBefore.length + amount);
  });

  it('Should create players in DB if all generated player names are the same', async () => {
    const sameName = 'same-name';
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(sameName);
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(sameName);
    jest
      .spyOn(passwordGenerator, 'generatePassword')
      .mockReturnValueOnce(sameName);

    const amount = 3;

    const playersInDBBefore = await playerModel.find();
    await service.createTesters(amount);
    const playersInDBAfter = await playerModel.find();

    expect(playersInDBAfter).toHaveLength(playersInDBBefore.length + amount);
  });

  it('Should return created testers', async () => {
    const amount = 5;

    const [createdTesters, errors] = await service.createTesters(amount);

    expect(errors).toBeNull();
    expect(createdTesters).toHaveLength(amount);
  });

  it('Should return ServiceError NOT_ALLOWED if amount is a negative number', async () => {
    const amount = -5;

    const [createdTesters, errors] = await service.createTesters(amount);

    expect(createdTesters).toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
    expect(errors[0].field).toBe('amount');
    expect(errors[0].value).toBe(amount);
  });

  it('Should not create any profiles and players if amount is a negative number', async () => {
    const amount = -5;

    await service.createTesters(amount);

    const profilesInDB = await profileModel.find();
    const playersInDB = await playerModel.find();

    expect(profilesInDB).toHaveLength(1);
    expect(playersInDB).toHaveLength(1);
  });

  it('Should return ServiceError NOT_ALLOWED if amount is more than 100', async () => {
    const amount = 100;

    const [createdTesters, errors] = await service.createTesters(amount);

    expect(createdTesters).toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
    expect(errors[0].field).toBe('amount');
    expect(errors[0].value).toBe(amount);
  });

  it('Should not create any profiles and players if amount is more than 100', async () => {
    const amount = 100;

    await service.createTesters(amount);

    const profilesInDB = await profileModel.find();
    const playersInDB = await playerModel.find();

    expect(profilesInDB).toHaveLength(1);
    expect(playersInDB).toHaveLength(1);
  });

  it('Should return ServiceError NOT_ALLOWED if amount is zero', async () => {
    const amount = 0;

    const [createdTesters, errors] = await service.createTesters(amount);

    expect(createdTesters).toBeNull();
    expect(errors).toContainSE_NOT_ALLOWED();
    expect(errors[0].field).toBe('amount');
    expect(errors[0].value).toBe(amount);
  });

  it('Should not create any profiles and players if amount is zero', async () => {
    const amount = 0;

    await service.createTesters(amount);

    const profilesInDB = await profileModel.find();
    const playersInDB = await playerModel.find();

    expect(profilesInDB).toHaveLength(1);
    expect(playersInDB).toHaveLength(1);
  });

  it('Should return ServiceError REQUIRED if amount is null', async () => {
    const [createdTesters, errors] = await service.createTesters(null);

    expect(createdTesters).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('amount');
    expect(errors[0].value).toBeNull();
  });

  it('Should return ServiceError REQUIRED if amount is undefined', async () => {
    const [createdTesters, errors] = await service.createTesters(undefined);

    expect(createdTesters).toBeNull();
    expect(errors).toContainSE_REQUIRED();
    expect(errors[0].field).toBe('amount');
    expect(errors[0].value).toBeNull();
  });
});
