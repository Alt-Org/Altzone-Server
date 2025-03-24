import { ObjectId } from 'mongodb';
import { BoxService } from '../../../box/box.service';
import BoxBuilderFactory from '../data/boxBuilderFactory';
import BoxModule from '../modules/box.module';
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
import { Box } from '../../../box/schemas/box.schema';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';
import { SEReason } from '../../../common/service/basicService/SEReason';
import ItemModule from '../../clanInventory/modules/item.module';

describe('BoxService.deleteBox() test suite', () => {
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let boxService: BoxService;
  let existingBox: Box;

  const boxBuilder = BoxBuilderFactory.getBuilder('Box');
  const boxModel = BoxModule.getBoxModel();
  const adminModel = BoxModule.getGroupAdminModel();
  const profileModel = ProfileModule.getProfileModel();
  const playerModel = PlayerModule.getPlayerModel();
  const clanModel = ClanModule.getClanModel();
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();
  const roomModel = RoomModule.getRoomModel();
  const stockModel = StockModule.getStockModel();
  const chatModel = ChatModule.getChatModel();
  const itemModel = ItemModule.getItemModel();

  const adminBuilder = BoxBuilderFactory.getBuilder('GroupAdmin');
  const testerBuilder = BoxBuilderFactory.getBuilder('Tester');
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
  const chatBuilder = ChatBuilderFactory.getBuilder('Chat');

  beforeEach(async () => {
    boxService = await BoxModule.getBoxService();

    const existingAdmin = adminBuilder.setPassword('adminPassword').build();
    const adminResp = await adminModel.create(existingAdmin);
    existingAdmin._id = adminResp._id;

    const adminProfile = profileBuilder.setUsername('adminUser').build();
    const adminProfileResp = await profileModel.create(adminProfile);
    adminProfile._id = adminProfileResp._id;

    const adminPlayer = playerBuilder
      .setName('adminPlayer')
      .setUniqueIdentifier('admin')
      .setProfileId(adminProfile._id)
      .build();
    const adminPlayerResp = await playerModel.create(adminPlayer);
    adminPlayer._id = adminPlayerResp._id;

    const existingClan1 = clanBuilder.setName('testClanOne').build();
    const existingClanResp1 = await clanModel.create(existingClan1);
    existingClan1._id = existingClanResp1._id;
    const existingClan2 = clanBuilder.setName('testClanTwo').build();
    const existingClanResp2 = await clanModel.create(existingClan2);
    existingClan2._id = existingClanResp2._id;

    const existingSoulHome1 = soulHomeBuilder.setName('testSoulHome1').build();
    existingSoulHome1.clan_id = existingClan1._id;
    const existingSoulHomeResp1 = await soulHomeModel.create(existingSoulHome1);
    existingSoulHome1._id = existingSoulHomeResp1._id;
    const existingSoulHome2 = soulHomeBuilder.setName('testSoulHome2').build();
    existingSoulHome2.clan_id = existingClan2._id;
    const existingSoulHomeResp2 = await soulHomeModel.create(existingSoulHome2);
    existingSoulHome2._id = existingSoulHomeResp2._id;

    const existingRoom1 = roomBuilder.build();
    existingRoom1.soulHome_id = existingSoulHome1._id;
    const existingRoomResp1 = await roomModel.create(existingRoom1);
    existingRoom1._id = existingRoomResp1._id;
    const existingRoom2 = roomBuilder.build();
    existingRoom2.soulHome_id = existingSoulHome2._id;
    const existingRoomResp2 = await roomModel.create(existingRoom2);
    existingRoom2._id = existingRoomResp2._id;

    const existingStock1 = stockBuilder.setClanId(existingClan1._id).build();
    const existingStockResp1 = await stockModel.create(existingStock1);
    existingStock1._id = existingStockResp1._id;
    const existingStock2 = stockBuilder.setClanId(existingClan2._id).build();
    const existingStockResp2 = await stockModel.create(existingStock2);
    existingStock2._id = existingStockResp2._id;

    const existingChat = chatBuilder.build();
    const existingChatResp = await chatModel.create(existingChat);
    existingChat._id = existingChatResp._id;

    const testerName1 = 'testerOne';
    const testerName2 = 'testerTwo';
    const testerProfile1 = profileBuilder.setUsername(testerName1).build();
    const testerProfileResp1 = await profileModel.create(testerProfile1);
    testerProfile1._id = testerProfileResp1._id;
    const testerProfile2 = profileBuilder.setUsername(testerName2).build();
    const testerProfileResp2 = await profileModel.create(testerProfile2);
    testerProfile2._id = testerProfileResp2._id;
    const testerPlayer1 = playerBuilder
      .setName(testerName1)
      .setUniqueIdentifier(testerName1)
      .setClanId(existingClan1._id)
      .setProfileId(testerProfile1._id)
      .build();
    const testerPlayerResp1 = await playerModel.create(testerPlayer1);
    testerPlayer1._id = testerPlayerResp1._id;
    const testerPlayer2 = playerBuilder
      .setName(testerName2)
      .setUniqueIdentifier(testerName2)
      .setClanId(existingClan1._id)
      .setProfileId(testerProfile2._id)
      .build();
    const testerPlayerResp2 = await playerModel.create(testerPlayer2);
    testerPlayer2._id = testerPlayerResp2._id;
    const tester1 = testerBuilder
      .setProfileId(new ObjectId(testerProfile1._id))
      .setPlayerId(new ObjectId(testerPlayer1._id))
      .build();
    const tester2 = testerBuilder
      .setProfileId(new ObjectId(testerProfile2._id))
      .setPlayerId(new ObjectId(testerPlayer2._id))
      .build();

    existingBox = boxBuilder
      .setAdminPassword(existingAdmin.password)
      .setAdminPlayerId(new ObjectId(adminPlayer._id))
      .setAdminProfileId(new ObjectId(adminProfile._id))
      .setClanIds([
        new ObjectId(existingClan1._id),
        new ObjectId(existingClan2._id),
      ])
      .setSoulHomeIds([
        new ObjectId(existingSoulHome1._id),
        new ObjectId(existingSoulHome2._id),
      ])
      .setRoomIds([
        new ObjectId(existingRoom1._id),
        new ObjectId(existingRoom2._id),
      ])
      .setStockIds([
        new ObjectId(existingStock1._id),
        new ObjectId(existingStock2._id),
      ])
      .setChatId(new ObjectId(existingChat._id))
      .setTesters([tester1, tester2])
      .build();

    const boxResp = await boxModel.create(existingBox);
    existingBox._id = boxResp._id;
  });

  describe('When deleting a box', () => {
    beforeEach(async () => {
      await boxService.deleteBox(existingBox._id.toString());
    });

    it('Should remove the box itself', async () => {
      const boxInDB = await boxModel.findById(existingBox._id);
      expect(boxInDB).toBeNull();
    });

    it('Should remove all clans associated with the box', async () => {
      const clansInDB = await clanModel.find({
        _id: { $in: existingBox.clan_ids },
      });
      expect(clansInDB).toHaveLength(0);
    });

    it('Should remove the admin player', async () => {
      const adminPlayerInDB = await playerModel.find({
        _id: existingBox.adminPlayer_id,
      });
      expect(adminPlayerInDB).toHaveLength(0);
    });

    it('Should remove the admin profile', async () => {
      const profileInDB = await profileModel.find({
        _id: existingBox.adminProfile_id,
      });
      expect(profileInDB).toHaveLength(0);
    });

    it('Should remove all soul homes', async () => {
      const soulHomesInDB = await soulHomeModel.find({
        _id: { $in: existingBox.soulHome_ids },
      });
      expect(soulHomesInDB).toHaveLength(0);
    });

    it('Should remove all rooms associated with soul homes', async () => {
      const roomsInDB = await roomModel.find({
        _id: { $in: existingBox.room_ids },
      });
      expect(roomsInDB).toHaveLength(0);
    });

    it('Should remove all stocks', async () => {
      const stocksInDB = await stockModel.find({
        _id: { $in: existingBox.stock_ids },
      });
      expect(stocksInDB).toHaveLength(0);
    });

    it('Should remove the chat', async () => {
      const chatInDB = await chatModel.findById(existingBox.chat_id);
      expect(chatInDB).toBeNull();
    });

    it('Should remove all tester profiles', async () => {
      const testerProfilesInDB = await profileModel.find({
        _id: { $in: existingBox.testers.map((tester) => tester.profile_id) },
      });
      expect(testerProfilesInDB).toHaveLength(0);
    });
  });

  it('Should throw an error if the box does not exist', async () => {
    const nonExistentBoxId = new ObjectId().toString();
    await expect(boxService.deleteBox(nonExistentBoxId)).rejects.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reason: SEReason.NOT_FOUND,
          message: 'Could not find any objects with specified id',
          field: '_id',
          value: nonExistentBoxId,
        }),
      ]),
    );
  });

  it('Should remove all items in the soul homes', async () => {
    // Assuming you have a model or method to query soul home items
    const soulHomeItems = await itemModel.find({
      soulHome_id: { $in: existingBox.soulHome_ids },
    });
    expect(soulHomeItems).toHaveLength(0);
  });

  it('Should remove all items in the stocks', async () => {
    // Assuming you have a model or method to query stock items
    const stockItems = await itemModel.find({
      stock_id: { $in: existingBox.stock_ids },
    });
    expect(stockItems).toHaveLength(0);
  });
});
