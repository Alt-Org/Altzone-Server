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
import { Box } from '../../../box/schemas/box.schema';
import { envVars } from '../../../common/service/envHandler/envVars';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';

describe('BoxService.deleteBoxReferences() test suite', () => {
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

  const adminBuilder = BoxBuilderFactory.getBuilder('GroupAdmin');
  const testerBuilder = BoxBuilderFactory.getBuilder('Tester');
  const profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
  const playerBuilder = PlayerBuilderFactory.getBuilder('Player');
  const clanBuilder = ClanBuilderFactory.getBuilder('Clan');
  const soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
  const roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
  const stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');

  beforeEach(async () => {
    boxService = await BoxModule.getBoxService();

    const existingAdmin = adminBuilder.setPassword('box-admin').build();
    const adminResp = await adminModel.create(existingAdmin);
    existingAdmin._id = adminResp._id;

    const adminProfile = profileBuilder.setUsername('box-admin').build();
    const adminProfileResp = await profileModel.create(adminProfile);
    adminProfile._id = adminProfileResp._id;

    const adminPlayer = playerBuilder
      .setName('box-admin')
      .setUniqueIdentifier('box-admin')
      .setProfileId(adminProfile._id)
      .build();
    const adminPlayerResp = await playerModel.create(adminPlayer);
    adminPlayer._id = adminPlayerResp._id;

    const existingClan1 = clanBuilder.setName('clan1').build();
    const existingClanResp1 = await clanModel.create(existingClan1);
    existingClan1._id = existingClanResp1._id;
    const existingClan2 = clanBuilder.setName('clan2').build();
    const existingClanResp2 = await clanModel.create(existingClan2);
    existingClan2._id = existingClanResp2._id;

    const existingSoulHome1 = soulHomeBuilder.setName('soulHome1').build();
    existingSoulHome1.clan_id = existingClan1._id;
    const existingSoulHomeResp1 = await soulHomeModel.create(existingSoulHome1);
    existingSoulHome1._id = existingSoulHomeResp1._id;
    const existingSoulHome2 = soulHomeBuilder.setName('soulHome2').build();
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

    const testerName1 = 'tester1';
    const testerName2 = 'tester2';
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
    testerBuilder.build();
    testerBuilder.build();

    existingBox = boxBuilder
      .setAdminPassword(existingAdmin.password)
      .setAdminPlayerId(new ObjectId(adminPlayer._id))
      .setAdminProfileId(new ObjectId(adminProfile._id))
      .setCreatedClan_ids([
        new ObjectId(existingClan1._id),
        new ObjectId(existingClan2._id),
      ])
      .build();

    const boxResp = await boxModel.create(existingBox);
    existingBox._id = boxResp._id;
  });

  it('Should return true if the box references were removed', async () => {
    const [isRemoved, errors] =
      await boxService.deleteBoxReferences(existingBox);

    expect(errors).toBeNull();
    expect(isRemoved).toBeTruthy();
  });

  it('Should delete all related clans from DB', async () => {
    await boxService.deleteBoxReferences(existingBox);

    const clansInDB = await clanModel.find({
      _id: { $in: existingBox.createdClan_ids },
    });
    expect(clansInDB).toHaveLength(0);
  });

  it('Should delete admin group player from DB', async () => {
    await boxService.deleteBoxReferences(existingBox);

    const adminPlayerInDB = await playerModel.find({
      _id: existingBox.adminPlayer_id,
    });
    expect(adminPlayerInDB).toHaveLength(0);
  });

  it('Should delete admin group profile from DB', async () => {
    await boxService.deleteBoxReferences(existingBox);

    const profileInDB = await profileModel.find({
      _id: existingBox.adminProfile_id,
    });
    expect(profileInDB).toHaveLength(0);
  });

  // it('Should delete all related soul homes from DB', async () => {
  //   await boxService.deleteBoxReferences(existingBox);

  //   const soulHomesInDB = await soulHomeModel.find({
  //     _id: { $in: existingBox.soulHome_ids },
  //   });
  //   expect(soulHomesInDB).toHaveLength(0);
  // });

  // it('Should delete all related rooms from DB', async () => {
  //   await boxService.deleteBoxReferences(existingBox);

  //   const roomsInDB = await roomModel.find({
  //     _id: { $in: existingBox.room_ids },
  //   });
  //   expect(roomsInDB).toHaveLength(0);
  // });

  // it('Should delete all related stocks from DB', async () => {
  //   await boxService.deleteBoxReferences(existingBox);

  //   const stocksInDB = await stockModel.find({
  //     _id: { $in: existingBox.stock_ids },
  //   });
  //   expect(stocksInDB).toHaveLength(0);
  // });
});
