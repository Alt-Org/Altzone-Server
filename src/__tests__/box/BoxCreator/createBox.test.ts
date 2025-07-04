import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';
import { ObjectId } from 'mongodb';
import BoxBuilderFactory from '../data/boxBuilderFactory';
import BoxModule from '../modules/box.module';
import ProfileModule from '../../profile/modules/profile.module';
import PlayerModule from '../../player/modules/player.module';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import LoggedUser from '../../test_utils/const/loggedUser';
import BoxCreator from '../../../box/boxCreator';
import PlayerBuilder from '../../player/data/player/playerBuilder';
import GroupAdminBuilder from '../data/groupAdmin/GroupAdminBuilder';
import { GroupAdmin } from '../../../box/groupAdmin/groupAdmin.schema';
import BoxBuilder from '../data/box/BoxBuilder';
import { CreateBoxDto } from '../../../box/dto/createBox.dto';
import CreateBoxDtoBuilder from '../data/box/CreateBoxDtoBuilder';

describe('BoxCreator.createBox() test suite', () => {
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let boxCreator: BoxCreator;

  const boxAdmin = 'box-admin';
  const adminName = 'box-admin';
  let createBoxBuilder: CreateBoxDtoBuilder;
  let boxBuilder: BoxBuilder;
  let boxToCreate: CreateBoxDto;
  const boxModel = BoxModule.getBoxModel();

  let adminBuilder: GroupAdminBuilder;
  let existingAdmin: GroupAdmin;
  const adminModel = BoxModule.getGroupAdminModel();

  const profileModel = ProfileModule.getProfileModel();
  const playerModel = PlayerModule.getPlayerModel();
  let playerBuilder: PlayerBuilder;

  beforeEach(async () => {
    boxCreator = await BoxModule.getBoxCreator();

    boxBuilder = BoxBuilderFactory.getBuilder('Box');
    createBoxBuilder = BoxBuilderFactory.getBuilder('CreateBoxDto');
    boxToCreate = createBoxBuilder
      .setAdminPassword(boxAdmin)
      .setPlayerName(adminName)
      .build();

    adminBuilder = BoxBuilderFactory.getBuilder('GroupAdmin');
    existingAdmin = adminBuilder.setPassword(boxAdmin).build();
    const adminResp = await adminModel.create(existingAdmin);
    existingAdmin._id = adminResp._id;

    playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  });

  it('Should create box in DB if input is valid', async () => {
    await boxCreator.createBox(boxToCreate);

    const dbResp = await boxModel.find({ adminPassword: boxAdmin });
    const boxInDB = dbResp[0]?.toObject();

    const clearedResp = clearDBRespDefaultFields(boxInDB);

    expect(dbResp).toHaveLength(1);
    expect(clearedResp.adminPassword).toBe(boxAdmin);
  });

  it('Should return created box data, if input is valid', async () => {
    const [result, errors] = await boxCreator.createBox(boxToCreate);

    const boxAdminPlayer = await playerModel.findById(result.adminPlayer_id);
    const {
      clan_id: _clan_id,
      clanRole_id: _clanRole_id,
      ...clearedPlayer
    } = clearDBRespDefaultFields(boxAdminPlayer);

    expect(errors).toBeNull();
    expect(result.adminPassword).toBe(boxAdmin);

    expect(result.adminPlayer).toEqual(expect.objectContaining(clearedPlayer));
  });

  it('Should create group admin profile', async () => {
    const [result] = await boxCreator.createBox(boxToCreate);

    const profileInDB = await profileModel.findById(result.adminProfile_id);

    expect(profileInDB.username).toBe(boxAdmin);
  });

  it('Should create group admin player', async () => {
    const [result] = await boxCreator.createBox(boxToCreate);

    const playerInDB = await playerModel.findById(result.adminPlayer_id);

    expect(playerInDB.name).toBe(boxToCreate.playerName);
    expect(playerInDB.profile_id).toEqual(result.adminProfile_id);
  });

  it('Should set session reset time to 7 days from now', async () => {
    const [result] = await boxCreator.createBox(boxToCreate);

    const boxInDB = await boxModel.findById(result._id);

    const weekMs = new Date().getTime() + 1000 * 60 * 60 * 24 * 7;
    const difference = Math.abs(weekMs - boxInDB.sessionResetTime);
    const minMs = 1000 * 60;
    expect(difference).toBeLessThan(minMs);
  });

  it('Should set box removal time to 30 days from now', async () => {
    const [result] = await boxCreator.createBox(boxToCreate);

    const boxInDB = await boxModel.findById(result._id);

    const monthMs = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    const difference = Math.abs(monthMs - boxInDB.boxRemovalTime);
    const minMs = 1000 * 60;
    expect(difference).toBeLessThan(minMs);
  });

  it('Should not save any box in DB, if the provided input is null', async () => {
    await boxCreator.createBox(null);

    const dbResp = await boxModel.findOne({ adminPassword: undefined });
    expect(dbResp).toBeNull();

    const dataLeft = await getBoxLeftData();
    expect(dataLeft).toBeNull();
  });

  it('Should return ServiceError with reason REQUIRED, if the provided input is null', async () => {
    const [result, errors] = await boxCreator.createBox(null);

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should not save any box in DB, if the provided input is undefined', async () => {
    await boxCreator.createBox(undefined);

    const dbResp = await boxModel.findOne({ adminPassword: undefined });
    expect(dbResp).toBeNull();

    const dataLeft = await getBoxLeftData();
    expect(dataLeft).toBeNull();
  });

  it('Should return ServiceError with reason REQUIRED, if the provided input is undefined', async () => {
    const [result, errors] = await boxCreator.createBox(undefined);

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return ServiceError with reason NOT_FOUND, if the provided adminPassword does not exists', async () => {
    const [result, errors] = await boxCreator.createBox({
      ...boxToCreate,
      adminPassword: 'non-existent',
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should not save any box data, if the provided adminPassword does not exists', async () => {
    await boxCreator.createBox({
      ...boxToCreate,
      adminPassword: 'non-existent',
    });

    const dataLeft = await getBoxLeftData();
    expect(dataLeft).toBeNull();
  });

  it('Should return ServiceError with reason NOT_UNIQUE, if box with provided adminPassword already registered', async () => {
    const existingBox = boxBuilder
      .setAdminPassword(boxToCreate.adminPassword)
      .setAdminProfileId(new ObjectId())
      .setAdminPlayerId(new ObjectId())
      .setClanIds([])
      .setSoulHomeIds([])
      .setRoomIds([])
      .setStockIds([])
      .build();
    await boxModel.create(existingBox);
    const [result, errors] = await boxCreator.createBox(boxToCreate);

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_UNIQUE();
    expect(errors[0].field).toBe('adminPassword');
    expect(errors[0].value).toBeNull();
  });

  it('Should not save any box data, if box with provided adminPassword already registered', async () => {
    const existingBox = boxBuilder
      .setAdminPassword(boxToCreate.adminPassword)
      .setAdminProfileId(new ObjectId())
      .setAdminPlayerId(new ObjectId())
      .setClanIds([])
      .setSoulHomeIds([])
      .setRoomIds([])
      .setStockIds([])
      .build();
    await boxModel.create(existingBox);
    await boxCreator.createBox(boxToCreate);

    const dataLeft = await getBoxLeftData();
    const { Box, ...otherData } = dataLeft;
    expect(otherData).toEqual({});
    expect(Box).toHaveLength(1);
    expect(Box[0].adminPassword).toBe(existingBox.adminPassword);
  });

  it('Should return ServiceError with reason NOT_UNIQUE, if player with provided name is already registered', async () => {
    const existingPlayer = playerBuilder
      .setName(boxToCreate.playerName)
      .build();
    await playerModel.create(existingPlayer);

    const [result, errors] = await boxCreator.createBox(boxToCreate);

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_UNIQUE();
    expect(errors[0].field).toEqual('playerName');
    expect(errors[0].value).toEqual(boxToCreate.playerName);
  });

  it('Should not save any box data, if player with provided name is already registered', async () => {
    const existingPlayer = playerBuilder
      .setName(boxToCreate.playerName)
      .build();
    await playerModel.create(existingPlayer);

    await boxCreator.createBox(boxToCreate);

    const dataLeft = await getBoxLeftData();
    const { Player, ...otherData } = dataLeft;
    expect(otherData).toEqual({});
    expect(Player).toHaveLength(1);
    expect(Player[0].name).toBe(existingPlayer.name);
  });

  /**
   * Checks whenever any box related data exists in DB.
   *
   * @returns a record with all references found
   */
  async function getBoxLeftData(): Promise<Record<string, any[]> | null> {
    const leftData: Record<string, any> = {};

    const boxesInDB = await boxModel.find();
    if (boxesInDB.length !== 0) leftData['Box'] = boxesInDB;

    const playersInDB = await playerModel.find({
      name: { $ne: LoggedUser.getPlayer().name },
    });
    if (playersInDB.length !== 0) leftData['Player'] = playersInDB;

    const profilesInDB = await profileModel.find({
      username: { $ne: LoggedUser.getProfile().username },
    });
    if (profilesInDB.length !== 0) leftData['Profile'] = profilesInDB;

    return Object.keys(leftData).length !== 0 ? leftData : null;
  }
});
