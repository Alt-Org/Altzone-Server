import { clearDBRespDefaultFields } from '../../test_utils/util/removeDBDefaultFields';
import { ObjectId } from 'mongodb';
import { BoxService } from '../../../box/box.service';
import BoxBuilderFactory from '../data/boxBuilderFactory';
import BoxModule from '../modules/box.module';
import { Box } from '../../../box/schemas/box.schema';
import ProfileModule from '../../profile/modules/profile.module';
import ProfileBuilderFactory from '../../profile/data/profileBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import PlayerModule from '../../player/modules/player.module';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import ClanModule from '../../clan/modules/clan.module';
import ClanInventoryBuilderFactory from '../../clanInventory/data/clanInventoryBuilderFactory';
import SoulhomeModule from '../../clanInventory/modules/soulhome.module';
import RoomModule from '../../clanInventory/modules/room.module';
import StockModule from '../../clanInventory/modules/stock.module';
import ChatBuilderFactory from '../../chat/data/chatBuilderFactory';
import ChatModule from '../../chat/modules/chat.module';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';

describe('BoxService.createOne() test suite', () => {
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let boxService: BoxService;
  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  const boxModel = BoxModule.getBoxModel();
  let validBox: Box;

  const boxAdmin = 'box-admin';
  const adminBuilder = BoxBuilderFactory.getBuilder('GroupAdmin');
  const existingAdmin = adminBuilder.setPassword(boxAdmin).build();
  const adminModel = BoxModule.getGroupAdminModel();

  const testerName1 = 'tester1';
  const testerName2 = 'tester2';
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const adminProfile = profileBuilder.setUsername(boxAdmin).build();
  const testerProfile1 = profileBuilder.setUsername(testerName1).build();
  const testerProfile2 = profileBuilder.setUsername(testerName2).build();
  const profileModel = ProfileModule.getProfileModel();
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const adminPlayer = playerBuilder
    .setName(boxAdmin)
    .setUniqueIdentifier(boxAdmin)
    .build();
  const testerPlayer1 = playerBuilder
    .setName(testerName1)
    .setUniqueIdentifier(testerName1)
    .build();
  const testerPlayer2 = playerBuilder
    .setName(testerName2)
    .setUniqueIdentifier(testerName2)
    .build();
  const playerModel = PlayerModule.getPlayerModel();

  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const existingClan1 = clanBuilder.setName('clan1').build();
  const existingClan2 = clanBuilder.setName('clan2').build();
  const clanModel = ClanModule.getClanModel();

  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const existingSoulHome1 = soulHomeBuilder.setName('clan1').build();
  const existingSoulHome2 = soulHomeBuilder.setName('clan2').build();
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();
  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const existingRoom11 = roomBuilder.build();
  const existingRoom12 = roomBuilder.build();
  const existingRoom21 = roomBuilder.build();
  const existingRoom22 = roomBuilder.build();
  const roomModel = RoomModule.getRoomModel();
  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const existingStock1 = stockBuilder.build();
  const existingStock2 = stockBuilder.build();
  const stockModel = StockModule.getStockModel();

  const chatBuilder = ChatBuilderFactory.getBuilder('Chat');
  const existingChat = chatBuilder.build();
  const chatModel = ChatModule.getChatModel();

  beforeEach(async () => {
    boxService = await BoxModule.getBoxService();

    const adminResp = await adminModel.create(existingAdmin);
    existingAdmin._id = adminResp._id;

    const adminProfileResp = await profileModel.create(adminProfile);
    adminProfile._id = adminProfileResp._id;
    const testerProfileResp1 = await profileModel.create(testerProfile1);
    testerProfile1._id = testerProfileResp1._id;
    const testerProfileResp2 = await profileModel.create(testerProfile2);
    testerProfile2._id = testerProfileResp2._id;

    const existingClanResp1 = await clanModel.create(existingClan1);
    existingClan1._id = existingClanResp1._id;
    const existingClanResp2 = await clanModel.create(existingClan2);
    existingClan2._id = existingClanResp2._id;

    adminPlayer.profile_id = adminProfile._id;
    const adminPlayerResp = await playerModel.create(adminPlayer);
    adminPlayer._id = adminPlayerResp._id;
    testerPlayer1.profile_id = testerProfile1._id;
    testerPlayer1.clan_id = existingClan1._id;
    const testerPlayerResp1 = await playerModel.create(testerPlayer1);
    testerPlayer1._id = testerPlayerResp1._id;
    testerPlayer2.profile_id = testerProfile2._id;
    testerPlayer2.clan_id = existingClan2._id;
    const testerPlayerResp2 = await playerModel.create(testerPlayer2);
    testerPlayer2._id = testerPlayerResp2._id;

    existingSoulHome1.clan_id = existingClan1._id;
    const existingSoulHomeResp1 = await soulHomeModel.create(existingSoulHome1);
    existingSoulHome1._id = existingSoulHomeResp1._id;
    existingSoulHome2.clan_id = existingClan2._id;
    const existingSoulHomeResp2 = await soulHomeModel.create(existingSoulHome2);
    existingSoulHome2._id = existingSoulHomeResp2._id;

    existingRoom11.soulHome_id = existingSoulHome1._id;
    const existingRoomResp11 = await roomModel.create(existingRoom11);
    existingRoom11._id = existingRoomResp11._id;
    existingRoom12.soulHome_id = existingSoulHome1._id;
    const existingRoomResp12 = await roomModel.create(existingRoom12);
    existingRoom12._id = existingRoomResp12._id;
    existingRoom21.soulHome_id = existingSoulHome2._id;
    const existingRoomResp21 = await roomModel.create(existingRoom21);
    existingRoom21._id = existingRoomResp21._id;
    existingRoom22.soulHome_id = existingSoulHome2._id;
    const existingRoomResp22 = await roomModel.create(existingRoom22);
    existingRoom22._id = existingRoomResp22._id;

    existingStock1.clan_id = existingClan1._id as any;
    const existingStockResp1 = await stockModel.create(existingStock1);
    existingStock1._id = existingStockResp1._id;
    existingStock2.clan_id = existingClan2._id as any;
    const existingStockResp2 = await stockModel.create(existingStock2);
    existingStock2._id = existingStockResp2._id;

    const existingChatResp = await chatModel.create(existingChat);
    existingChat._id = existingChatResp._id;

    validBox = boxBuilder
      .setAdminPassword(existingAdmin.password)
      .setAdminPlayerId(new ObjectId(adminPlayer._id))
      .setAdminProfileId(new ObjectId(adminProfile._id))
      .setTesters([
        {
          profile_id: new ObjectId(testerProfile1._id),
          player_id: new ObjectId(testerPlayer1._id),
          isClaimed: false,
        },
        {
          profile_id: new ObjectId(testerProfile2._id),
          player_id: new ObjectId(testerPlayer2._id),
          isClaimed: false,
        },
      ])
      .setClanIds([
        new ObjectId(existingClan1._id),
        new ObjectId(existingClan2._id),
      ])
      .setSoulHomeIds([
        new ObjectId(existingSoulHome1._id),
        new ObjectId(existingSoulHome2._id),
      ])
      .setRoomIds([
        new ObjectId(existingRoom11._id),
        new ObjectId(existingRoom12._id),
        new ObjectId(existingRoom21._id),
        new ObjectId(existingRoom22._id),
      ])
      .setStockIds([
        new ObjectId(existingStock1._id),
        new ObjectId(existingStock2._id),
      ])
      .setChatId(new ObjectId(existingChat._id))
      .build();
  });

  it('Should save box data to DB if input is valid', async () => {
    await boxService.createOne(validBox);

    const dbResp = await boxModel.find({ adminPassword: boxAdmin });
    const boxInDB = dbResp[0]?.toObject();

    const clearedResp = clearDBRespDefaultFields(boxInDB);

    expect(dbResp).toHaveLength(1);
    expect(clearedResp).toEqual(
      expect.objectContaining({
        ...validBox,
        _id: expect.any(ObjectId),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        testersSharedPassword: null,
        testers: expect.any(Array),
      }),
    );
  });

  it('Should return saved box data, if input is valid', async () => {
    const [result, errors] = await boxService.createOne(validBox);

    const clearedBox = clearDBRespDefaultFields(result);
    const clearedResp = clearDBRespDefaultFields(clearedBox);

    expect(errors).toBeNull();
    expect(clearedResp).toEqual(
      expect.objectContaining({
        ...validBox,
        _id: expect.any(ObjectId),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        testersSharedPassword: null,
        testers: expect.any(Array),
      }),
    );
  });

  it('Should not save any box in DB, if the provided adminPassword is null', async () => {
    const invalidBox = { ...validBox, adminPassword: null } as any;
    await boxService.createOne(invalidBox);

    const dbResp = await boxModel.findOne({ adminPassword: boxAdmin });

    expect(dbResp).toBeNull();
  });

  it('Should return ServiceError with reason REQUIRED, if the provided adminPassword is null', async () => {
    const invalidBox = { ...validBox, adminPassword: null } as any;
    const [result, errors] = await boxService.createOne(invalidBox);

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return ServiceError REQUIRED if provided input is null', async () => {
    const [result, errors] = await boxService.createOne(null);

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return ServiceError REQUIRED if provided input is undefined', async () => {
    const [result, errors] = await boxService.createOne(undefined);

    expect(result).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return ServiceError with reason NOT_FOUND, if the provided adminPassword does not exists', async () => {
    const [result, errors] = await boxService.createOne({
      ...validBox,
      adminPassword: 'non-existent',
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError with reason NOT_FOUND, if any of the provided clans does not exists', async () => {
    const [result, errors] = await boxService.createOne({
      ...validBox,
      clan_ids: [...validBox.clan_ids, new ObjectId(getNonExisting_id())],
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError with reason NOT_FOUND, if any of the provided testers does not exists', async () => {
    const nonExistingTester = {
      profile_id: new ObjectId(getNonExisting_id()),
      player_id: new ObjectId(getNonExisting_id()),
      isClaimed: false,
    };
    const [result, errors] = await boxService.createOne({
      ...validBox,
      testers: [...validBox.testers, nonExistingTester],
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError with reason NOT_FOUND, if the provided admin profile does not exists', async () => {
    const [result, errors] = await boxService.createOne({
      ...validBox,
      adminProfile_id: new ObjectId(getNonExisting_id()),
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError with reason NOT_FOUND, if the provided admin player does not exists', async () => {
    const [result, errors] = await boxService.createOne({
      ...validBox,
      adminPlayer_id: new ObjectId(getNonExisting_id()),
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError with reason NOT_FOUND, if the provided chat does not exists', async () => {
    const [result, errors] = await boxService.createOne({
      ...validBox,
      chat_id: new ObjectId(getNonExisting_id()),
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError with reason NOT_FOUND, if any of the provided stocks does not exists', async () => {
    const [result, errors] = await boxService.createOne({
      ...validBox,
      stock_ids: [new ObjectId(getNonExisting_id())],
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError with reason NOT_FOUND, if any of the provided soul homes does not exists', async () => {
    const [result, errors] = await boxService.createOne({
      ...validBox,
      soulHome_ids: [new ObjectId(getNonExisting_id())],
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError with reason NOT_FOUND, if any of the provided rooms does not exists', async () => {
    const [result, errors] = await boxService.createOne({
      ...validBox,
      room_ids: [new ObjectId(getNonExisting_id())],
    });

    expect(result).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });
});
