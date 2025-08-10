import { ObjectId } from 'mongodb';
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
import { BoxScheduler } from '../../../box/box.scheduler';

describe('BoxScheduler.resetTestingSessions() test suite', () => {
  let boxScheduler: BoxScheduler;
  let boxToDelete: Box;

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
    boxScheduler = await BoxModule.getBoxScheduler();

    const existingAdmin = adminBuilder.setPassword('adminPassword22').build();
    const adminResp = await adminModel.create(existingAdmin);
    existingAdmin._id = adminResp._id;

    const adminProfile = profileBuilder.setUsername('adminUser22').build();
    const adminProfileResp = await profileModel.create(adminProfile);
    adminProfile._id = adminProfileResp._id;

    const adminPlayer = playerBuilder
      .setName('adminPlayer22')
      .setUniqueIdentifier('admin22')
      .setProfileId(adminProfile._id)
      .build();
    const adminPlayerResp = await playerModel.create(adminPlayer);
    adminPlayer._id = adminPlayerResp._id;

    const existingClan1 = clanBuilder.setName('testClanOne22').build();
    const existingClanResp1 = await clanModel.create(existingClan1);
    existingClan1._id = existingClanResp1._id;
    const existingClan2 = clanBuilder.setName('testClanTwo22').build();
    const existingClanResp2 = await clanModel.create(existingClan2);
    existingClan2._id = existingClanResp2._id;

    const existingSoulHome1 = soulHomeBuilder
      .setName('testSoulHome122')
      .build();
    existingSoulHome1.clan_id = existingClan1._id;
    const existingSoulHomeResp1 = await soulHomeModel.create(existingSoulHome1);
    existingSoulHome1._id = existingSoulHomeResp1._id;
    const existingSoulHome2 = soulHomeBuilder
      .setName('testSoulHome222')
      .build();
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

    const testerName1 = 'testerOne22';
    const testerName2 = 'testerTwo22';
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

    boxToDelete = boxBuilder
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
      .setBoxRemovalTime(new Date().getTime())
      .setSessionResetTime(new Date().getTime() + 10000)
      .build();

    const boxResp = await boxModel.create(boxToDelete);
    boxToDelete._id = boxResp._id;
  });

  it('Should delete boxes with expired removal time and associated clan models', async () => {
    await boxScheduler.resetTestingSessions();

    const boxToDeleteInDB = await boxModel.findById(boxToDelete._id);
    expect(boxToDeleteInDB).toBeNull();

    const adminPlayer = await playerModel.findById(boxToDelete.adminPlayer_id);
    expect(adminPlayer).toBeNull();

    const adminProfile = await profileModel.findById(
      boxToDelete.adminProfile_id,
    );
    expect(adminProfile).toBeNull();

    for (const clanId of boxToDelete.clan_ids) {
      const clan = await clanModel.findById(clanId);
      expect(clan).toBeNull();
    }

    for (const soulHomeId of boxToDelete.soulHome_ids) {
      const soulHome = await soulHomeModel.findById(soulHomeId);
      expect(soulHome).toBeNull();
    }

    for (const roomId of boxToDelete.room_ids) {
      const room = await roomModel.findById(roomId);
      expect(room).toBeNull();
    }

    for (const stockId of boxToDelete.stock_ids) {
      const stock = await stockModel.findById(stockId);
      expect(stock).toBeNull();
    }
  });

  it('Should not delete boxes with not expired removal time', async () => {
    await boxModel.updateOne(
      { _id: boxToDelete._id },
      { $set: { boxRemovalTime: new Date().getTime() + 10000 } },
    );
    await boxScheduler.resetTestingSessions();

    const boxToKeep = await boxModel.findById(boxToDelete._id);
    expect(boxToKeep).not.toBeNull();
    expect(boxToKeep.adminPassword).toBe(boxToDelete.adminPassword);
    expect(boxToKeep.adminPlayer_id.toString()).toBe(
      boxToDelete.adminPlayer_id.toString(),
    );
    expect(boxToKeep.adminProfile_id.toString()).toBe(
      boxToDelete.adminProfile_id.toString(),
    );
    expect(boxToKeep.clan_ids.map((id) => id.toString())).toEqual(
      boxToDelete.clan_ids.map((id) => id.toString()),
    );
    expect(boxToKeep.soulHome_ids.map((id) => id.toString())).toEqual(
      boxToDelete.soulHome_ids.map((id) => id.toString()),
    );
    expect(boxToKeep.room_ids.map((id) => id.toString())).toEqual(
      boxToDelete.room_ids.map((id) => id.toString()),
    );
    expect(boxToKeep.stock_ids.map((id) => id.toString())).toEqual(
      boxToDelete.stock_ids.map((id) => id.toString()),
    );
  });

  it('Should reset the box with expired reset time', async () => {
    await boxModel.updateOne(
      { _id: boxToDelete._id },
      {
        $set: {
          sessionResetTime: new Date().getTime(),
          boxRemovalTime: new Date().getTime() + 10000,
        },
      },
    );
    await boxScheduler.resetTestingSessions();

    const boxToReset = await boxModel.findOne({
      adminPassword: boxToDelete.adminPassword,
    });
    expect(boxToReset).not.toBeNull();
    expect(boxToReset._id.toString()).not.toBe(boxToDelete._id.toString());
    expect(boxToReset.adminPassword).toBe(boxToDelete.adminPassword);
    expect(boxToReset.adminPlayer_id.toString()).not.toBe(
      boxToDelete.adminPlayer_id.toString(),
    );
    expect(boxToReset.adminProfile_id.toString()).not.toBe(
      boxToDelete.adminProfile_id.toString(),
    );
    expect(boxToReset.clan_ids.map((id) => id.toString())).not.toEqual(
      boxToDelete.clan_ids.map((id) => id.toString()),
    );
    expect(boxToReset.soulHome_ids.map((id) => id.toString())).not.toEqual(
      boxToDelete.soulHome_ids.map((id) => id.toString()),
    );
    expect(boxToReset.room_ids.map((id) => id.toString())).not.toEqual(
      boxToDelete.room_ids.map((id) => id.toString()),
    );
    expect(boxToReset.stock_ids.map((id) => id.toString())).not.toEqual(
      boxToDelete.stock_ids.map((id) => id.toString()),
    );
  });
});
