import BoxModule from '../../modules/box.module';
import { Box } from '../../../../box/schemas/box.schema';
import ProfileModule from '../../../profile/modules/profile.module';
import PlayerModule from '../../../player/modules/player.module';
import { ObjectId } from 'mongodb';
import BoxBuilderFactory from '../../data/boxBuilderFactory';
import ProfileBuilderFactory from '../../../profile/data/profileBuilderFactory';
import PlayerBuilderFactory from '../../../player/data/playerBuilderFactory';
import { TesterAccountService } from '../../../../box/accountClaimer/testerAccount.service';
import { envVars } from '../../../../common/service/envHandler/envVars';
import { Environment } from '../../../../common/service/envHandler/enum/environment.enum';

const generatePasswordMock = jest.fn();
jest.mock('../../../../common/function/passwordGenerator', () => {
  return {
    PasswordGenerator: jest.fn().mockImplementation(() => {
      return {
        generatePassword: generatePasswordMock,
      };
    }),
  };
});

describe('TesterAccountService.createTester() test suite', () => {
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;
  let service: TesterAccountService;

  const boxModel = BoxModule.getBoxModel();
  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  let existingBox: Box;

  const profileModel = ProfileModule.getProfileModel();
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const playerModel = PlayerModule.getPlayerModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');

  beforeEach(async () => {
    service = await BoxModule.getTesterAccountService();

    existingBox = boxBuilder
      .setAdminPlayerId(new ObjectId())
      .setAdminProfileId(new ObjectId())
      .build();
    const boxResp = await boxModel.create(existingBox);
    existingBox._id = boxResp._id;
  });

  it('Should create a profile in DB', async () => {
    const username = 'my-username';
    generatePasswordMock.mockReturnValueOnce(username);

    await service.createTester();

    const profilesInDB = await profileModel.findOne({ username });

    expect(profilesInDB).not.toBeNull();
  });

  it('Should create a player in DB', async () => {
    const name = 'my-player';
    generatePasswordMock.mockReturnValueOnce(name);

    await service.createTester();

    const playersInDB = await playerModel.findOne({ name });

    expect(playersInDB).not.toBeNull();
  });

  it('Should return created tester', async () => {
    generatePasswordMock.mockReturnValueOnce('tester');
    const [createdTester, errors] = await service.createTester();

    expect(errors).toBeNull();
    expect(createdTester.Profile).not.toBeNull();
    expect(createdTester.Player).not.toBeNull();
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

    generatePasswordMock.mockReturnValueOnce(existingUsername1);

    const profilesInDBBefore = await profileModel.find();
    await service.createTester();
    const profilesInDBAfter = await profileModel.find();

    expect(profilesInDBAfter).toHaveLength(profilesInDBBefore.length + 1);
  });

  it('Should create profile in DB if there are already one profile with the generated username', async () => {
    const existingUsername = 'existing-username';
    const existingProfile = profileBuilder
      .setUsername(existingUsername)
      .build();
    await profileModel.create(existingProfile);
    generatePasswordMock.mockReturnValueOnce(existingUsername);

    const profilesInDBBefore = await profileModel.find();
    await service.createTester();
    const profilesInDBAfter = await profileModel.find();

    expect(profilesInDBAfter).toHaveLength(profilesInDBBefore.length + 1);
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
    generatePasswordMock.mockReturnValueOnce(existingName1);

    const playersInDBBefore = await playerModel.find();
    await service.createTester();
    const playersInDBAfter = await playerModel.find();

    expect(playersInDBAfter).toHaveLength(playersInDBBefore.length + 1);
  });

  it('Should create player in DB if there are already one player with the generated name', async () => {
    const existingName = 'existing-name';
    const existingPlayer = playerBuilder
      .setName(existingName)
      .setUniqueIdentifier(existingName)
      .build();
    await playerModel.create(existingPlayer);
    generatePasswordMock.mockReturnValueOnce(existingName);

    const playersInDBBefore = await playerModel.find();
    await service.createTester();
    const playersInDBAfter = await playerModel.find();

    expect(playersInDBAfter).toHaveLength(playersInDBBefore.length + 1);
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
    generatePasswordMock.mockReturnValueOnce(existingId1);

    const playersInDBBefore = await playerModel.find();
    await service.createTester();
    const playersInDBAfter = await playerModel.find();

    expect(playersInDBAfter).toHaveLength(playersInDBBefore.length + 1);
  });

  it('Should create player in DB if there are already one player with the generated uniqueIdentifier', async () => {
    const existingId = 'existing-name';
    const existingPlayer = playerBuilder
      .setName('some-name-1')
      .setUniqueIdentifier(existingId)
      .build();
    await playerModel.create(existingPlayer);
    generatePasswordMock.mockReturnValueOnce(existingId);

    const playersInDBBefore = await playerModel.find();
    await service.createTester();
    const playersInDBAfter = await playerModel.find();

    expect(playersInDBAfter).toHaveLength(playersInDBBefore.length + 1);
  });

  it('Should create profiles in DB if all generated usernames are the same', async () => {
    const sameUsername = 'same-username';
    generatePasswordMock.mockReturnValue(sameUsername);

    const profilesInDBBefore = await profileModel.find();
    await service.createTester();
    await service.createTester();
    await service.createTester();
    const profilesInDBAfter = await profileModel.find();

    expect(profilesInDBAfter).toHaveLength(profilesInDBBefore.length + 3);
  });

  it('Should create players in DB if all generated player names are the same', async () => {
    const sameName = 'same-name';
    generatePasswordMock.mockReturnValue(sameName);

    const playersInDBBefore = await playerModel.find();
    await service.createTester();
    await service.createTester();
    await service.createTester();
    const playersInDBAfter = await playerModel.find();

    expect(playersInDBAfter).toHaveLength(playersInDBBefore.length + 3);
  });
});
