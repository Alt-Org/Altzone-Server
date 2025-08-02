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
import { Model } from 'mongoose';
import { Environment } from '../../../common/service/envHandler/enum/environment.enum';
import { envVars } from '../../../common/service/envHandler/envVars';
import { GroupAdmin } from '../../../box/groupAdmin/groupAdmin.schema';
import { Player } from '../../../player/schemas/player.schema';
import { Profile } from '../../../profile/profile.schema';
import ClanBuilder from '../../clan/data/clan/ClanBuilder';
import PlayerBuilder from '../../player/data/player/playerBuilder';
import BoxBuilder from '../data/box/BoxBuilder';
import GroupAdminBuilder from '../data/groupAdmin/GroupAdminBuilder';
import { SessionStage } from '../../../box/enum/SessionStage.enum';
import SoulHomeBuilder from '../../clanInventory/data/soulhome/SoulHomeBuilder';
import RoomBuilder from '../../clanInventory/data/room/RoomBuilder';
import StockBuilder from '../../clanInventory/data/stock/StockBuilder';
import ItemBuilder from '../../clanInventory/data/item/ItemBuilder';
import ItemModule from '../../clanInventory/modules/item.module';
import ProfileBuilder from '../../profile/data/profile/profileBuilder';

describe('BoxScheduler.resetTestingSessions() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let boxScheduler: BoxScheduler;
  let box: Box;
  let admin: GroupAdmin;
  let adminProfile: Profile;
  let adminPlayer: Player;

  const clanModel = ClanModule.getClanModel();
  let clanBuilder: ClanBuilder;
  const soulHomeModel = SoulhomeModule.getSoulhomeModel();
  let soulHomeBuilder: SoulHomeBuilder;
  const roomModel = RoomModule.getRoomModel();
  let roomBuilder: RoomBuilder;
  const stockModel = StockModule.getStockModel();
  let stockBuilder: StockBuilder;
  const itemModel = ItemModule.getItemModel();
  let itemBuilder: ItemBuilder;

  const profileModel = ProfileModule.getProfileModel();
  let profileBuilder: ProfileBuilder;
  const playerModel = PlayerModule.getPlayerModel();
  let playerBuilder: PlayerBuilder;

  const boxModel = BoxModule.getBoxModel();
  let boxBuilder: BoxBuilder;
  const adminModel = BoxModule.getGroupAdminModel();
  let adminBuilder: GroupAdminBuilder;

  beforeEach(async () => {
    boxScheduler = await BoxModule.getBoxScheduler();
    initAllBuilders();
    [box, admin, adminProfile, adminPlayer] = await createBoxAndAdmin();
  });

  it('Should delete boxes with expired removal time and associated data', async () => {
    const clan = clanBuilder.build();
    const [clan_ids] = await createBoxInstances(clanModel, [clan]);
    const soulHome = soulHomeBuilder
      .setClanId(new ObjectId().toString())
      .build();
    const [soulHome_ids] = await createBoxInstances(soulHomeModel, [soulHome]);
    const room = roomBuilder.setSoulHomeId(new ObjectId().toString()).build();
    const [room_ids] = await createBoxInstances(roomModel, [room]);
    const stock = stockBuilder.setClanId(new ObjectId()).build();
    const [stock_ids] = await createBoxInstances(stockModel, [stock]);
    const item = itemBuilder.setRoomId(new ObjectId()).build();
    const [item_ids] = await createBoxInstances(itemModel, [item]);

    const profile = profileBuilder.setUsername('user1').build();
    const [profile_ids] = await createBoxInstances(profileModel, [profile]);
    const player = playerBuilder
      .setName('user1')
      .setUniqueIdentifier('user1')
      .build();
    const [player_ids] = await createBoxInstances(playerModel, [player]);

    await boxModel.findByIdAndUpdate(box._id, {
      $set: { boxRemovalTime: new Date().getTime() - 10000 },
    });

    await boxScheduler.resetTestingSessions();

    await expectDataIsRemoved(clanModel, clan_ids);
    await expectDataIsRemoved(soulHomeModel, soulHome_ids);
    await expectDataIsRemoved(roomModel, room_ids);
    await expectDataIsRemoved(stockModel, stock_ids);
    await expectDataIsRemoved(itemModel, item_ids);
    await expectDataIsRemoved(profileModel, profile_ids);
    await expectDataIsRemoved(playerModel, player_ids);
    await expectDataIsRemoved(boxModel, [box._id.toString()]);
    await expectDataIsRemoved(playerModel, [adminPlayer._id.toString()]);
    await expectDataIsRemoved(profileModel, [adminProfile._id.toString()]);
    await expectDataIsRemoved(adminModel, [admin._id.toString()]);
  });

  it('Should not delete boxes with not expired removal time', async () => {
    const clan = clanBuilder.build();
    const [clan_ids] = await createBoxInstances(clanModel, [clan]);
    const soulHome = soulHomeBuilder
      .setClanId(new ObjectId().toString())
      .build();
    const [soulHome_ids] = await createBoxInstances(soulHomeModel, [soulHome]);
    const room = roomBuilder.setSoulHomeId(new ObjectId().toString()).build();
    const [room_ids] = await createBoxInstances(roomModel, [room]);
    const stock = stockBuilder.setClanId(new ObjectId()).build();
    const [stock_ids] = await createBoxInstances(stockModel, [stock]);
    const item = itemBuilder.setRoomId(new ObjectId()).build();
    const [item_ids] = await createBoxInstances(itemModel, [item]);

    const profile = profileBuilder.setUsername('user1').build();
    const [profile_ids] = await createBoxInstances(profileModel, [profile]);
    const player = playerBuilder
      .setName('user1')
      .setUniqueIdentifier('user1')
      .build();
    const [player_ids] = await createBoxInstances(playerModel, [player]);

    await boxModel.findByIdAndUpdate(box._id, {
      $set: { boxRemovalTime: new Date().getTime() + 10000 },
    });

    await boxScheduler.resetTestingSessions();

    await expectDataIsNotRemoved(clanModel, clan_ids);
    await expectDataIsNotRemoved(soulHomeModel, soulHome_ids);
    await expectDataIsNotRemoved(roomModel, room_ids);
    await expectDataIsNotRemoved(stockModel, stock_ids);
    await expectDataIsNotRemoved(itemModel, item_ids);
    await expectDataIsNotRemoved(profileModel, profile_ids);
    await expectDataIsNotRemoved(playerModel, player_ids);
    await expectDataIsNotRemoved(boxModel, [box._id.toString()]);
    await expectDataIsNotRemoved(playerModel, [adminPlayer._id.toString()]);
    await expectDataIsNotRemoved(profileModel, [adminProfile._id.toString()]);
    await expectDataIsNotRemoved(adminModel, [admin._id.toString()]);
  });

  it('Should reset the box with expired reset time', async () => {
    const clan = clanBuilder.build();
    const [clan_ids] = await createBoxInstances(clanModel, [clan]);
    const soulHome = soulHomeBuilder
      .setClanId(new ObjectId().toString())
      .build();
    const [soulHome_ids] = await createBoxInstances(soulHomeModel, [soulHome]);
    const room = roomBuilder.setSoulHomeId(new ObjectId().toString()).build();
    const [room_ids] = await createBoxInstances(roomModel, [room]);
    const stock = stockBuilder.setClanId(new ObjectId()).build();
    const [stock_ids] = await createBoxInstances(stockModel, [stock]);
    const item = itemBuilder.setRoomId(new ObjectId()).build();
    const [item_ids] = await createBoxInstances(itemModel, [item]);

    const profile = profileBuilder.setUsername('user1').build();
    const [profile_ids] = await createBoxInstances(profileModel, [profile]);
    const player = playerBuilder
      .setName('user1')
      .setUniqueIdentifier('user1')
      .build();
    const [player_ids] = await createBoxInstances(playerModel, [player]);

    await boxModel.findByIdAndUpdate(box._id, {
      $set: { sessionResetTime: new Date().getTime() - 10000 },
    });

    await boxScheduler.resetTestingSessions();

    await expectDataIsRemoved(clanModel, clan_ids);
    await expectDataIsRemoved(soulHomeModel, soulHome_ids);
    await expectDataIsRemoved(roomModel, room_ids);
    await expectDataIsRemoved(stockModel, stock_ids);
    await expectDataIsRemoved(itemModel, item_ids);
    await expectDataIsRemoved(profileModel, profile_ids);
    await expectDataIsRemoved(playerModel, player_ids);
    await expectDataIsNotRemoved(boxModel, [box._id.toString()]);
    await expectDataIsNotRemoved(playerModel, [adminPlayer._id.toString()]);
    await expectDataIsNotRemoved(profileModel, [adminProfile._id.toString()]);
    await expectDataIsNotRemoved(adminModel, [admin._id.toString()]);
  });

  it('Should not reset the box without expired reset time', async () => {
    const clan = clanBuilder.build();
    const [clan_ids] = await createBoxInstances(clanModel, [clan]);
    const soulHome = soulHomeBuilder
      .setClanId(new ObjectId().toString())
      .build();
    const [soulHome_ids] = await createBoxInstances(soulHomeModel, [soulHome]);
    const room = roomBuilder.setSoulHomeId(new ObjectId().toString()).build();
    const [room_ids] = await createBoxInstances(roomModel, [room]);
    const stock = stockBuilder.setClanId(new ObjectId()).build();
    const [stock_ids] = await createBoxInstances(stockModel, [stock]);
    const item = itemBuilder.setRoomId(new ObjectId()).build();
    const [item_ids] = await createBoxInstances(itemModel, [item]);

    const profile = profileBuilder.setUsername('user1').build();
    const [profile_ids] = await createBoxInstances(profileModel, [profile]);
    const player = playerBuilder
      .setName('user1')
      .setUniqueIdentifier('user1')
      .build();
    const [player_ids] = await createBoxInstances(playerModel, [player]);

    await boxModel.findByIdAndUpdate(box._id, {
      $set: { sessionResetTime: new Date().getTime() + 10000 },
    });

    await boxScheduler.resetTestingSessions();

    await expectDataIsNotRemoved(clanModel, clan_ids);
    await expectDataIsNotRemoved(soulHomeModel, soulHome_ids);
    await expectDataIsNotRemoved(roomModel, room_ids);
    await expectDataIsNotRemoved(stockModel, stock_ids);
    await expectDataIsNotRemoved(itemModel, item_ids);
    await expectDataIsNotRemoved(profileModel, profile_ids);
    await expectDataIsNotRemoved(playerModel, player_ids);
    await expectDataIsNotRemoved(boxModel, [box._id.toString()]);
    await expectDataIsNotRemoved(playerModel, [adminPlayer._id.toString()]);
    await expectDataIsNotRemoved(profileModel, [adminProfile._id.toString()]);
    await expectDataIsNotRemoved(adminModel, [admin._id.toString()]);
  });

  /**
   * Creates an object in DB, which is related to the common box, meaning with set `box_id` field
   * @param model model where to create
   * @param instances array of objects to be created
   * @param box_id _ids of the box, default the box used in tests
   *
   * @returns created objects _ids and objects themselves
   */
  async function createBoxInstances(
    model: Model<any>,
    instances: any[],
    box_id?: ObjectId | string,
  ): Promise<[string[], any[]]> {
    const _id = box_id ?? box._id;

    for (const instance of instances) instance.box_id = _id.toString();

    const createdObjects = await model.insertMany(instances);

    const objects_ids: string[] = createdObjects.map((object) =>
      object._id.toString(),
    );

    return [objects_ids, createdObjects];
  }

  /**
   * Counts the amount of instances in DB with provided _ids
   *
   * @param model model where to search
   * @param _ids _ids of the instances to search
   *
   * @returns amount of instances
   */
  async function getInstancesAmount(
    model: Model<any>,
    _ids: (string | ObjectId)[],
  ) {
    const instancesInDB = await model.find({
      _id: { $in: _ids },
    });

    return instancesInDB.length;
  }

  /**
   * Calls expect assertion and checks whenever there are no objects in DB left
   * @param model where to check
   * @param _ids which to search
   */
  async function expectDataIsRemoved(model: any, _ids: (string | ObjectId)[]) {
    const clansAmount = await getInstancesAmount(model, _ids);
    expect(clansAmount).toBe(0);
  }

  /**
   * Calls expect assertion and checks whenever the objects are not removed from DB
   * @param model where to check
   * @param _ids which to search
   */
  async function expectDataIsNotRemoved(
    model: any,
    _ids: (string | ObjectId)[],
  ) {
    const clansAmount = await getInstancesAmount(model, _ids);
    expect(clansAmount).not.toBe(0);
  }

  /**
   * Initializes all required builders for the test suite
   */
  function initAllBuilders() {
    clanBuilder = ClanBuilderFactory.getBuilder('Clan');
    soulHomeBuilder = ClanInventoryBuilderFactory.getBuilder('SoulHome');
    roomBuilder = ClanInventoryBuilderFactory.getBuilder('Room');
    stockBuilder = ClanInventoryBuilderFactory.getBuilder('Stock');
    itemBuilder = ClanInventoryBuilderFactory.getBuilder('Item');

    profileBuilder = ProfileBuilderFactory.getBuilder('Profile');
    playerBuilder = PlayerBuilderFactory.getBuilder('Player');

    boxBuilder = BoxBuilderFactory.getBuilder('Box');
    adminBuilder = BoxBuilderFactory.getBuilder('GroupAdmin');
  }

  /**
   * Create required setup for tests:
   * - Box
   * - Group admin
   * - Group admin profile
   * - Group admin player
   *
   * @returns created objects
   */
  async function createBoxAndAdmin() {
    const boxToCreate = boxBuilder
      .setAdminPassword('box-admin')
      .setAdminPlayerId(new ObjectId())
      .setAdminProfileId(new ObjectId())
      .build();
    const createdBox = await boxModel.create(boxToCreate);

    const adminToCreate = adminBuilder
      .setPassword(createdBox.adminPassword)
      .build();
    const admin = (
      await createBoxInstances(adminModel, [adminToCreate], createdBox._id)
    )[1][0];
    const profileToCreate = profileBuilder
      .setUsername(createdBox.adminPassword)
      .build();
    const adminProfile = (
      await createBoxInstances(profileModel, [profileToCreate], createdBox._id)
    )[1][0];
    const playerToCreate = playerBuilder
      .setName(createdBox.adminPassword)
      .setUniqueIdentifier(createdBox.adminPassword)
      .setProfileId(profileToCreate._id)
      .build();
    adminPlayer = (
      await createBoxInstances(playerModel, [playerToCreate], createdBox._id)
    )[1][0];

    const boxToUpdate: any = boxBuilder
      .setAdminPlayerId(new ObjectId(adminPlayer._id))
      .setAdminProfileId(new ObjectId(adminProfile._id))
      .setSessionStage(SessionStage.END)
      .build();

    boxToUpdate.box_id = createdBox._id.toString();
    const updatedBox = await boxModel.findByIdAndUpdate(
      createdBox._id,
      boxToUpdate,
    );

    return [updatedBox, admin, adminProfile, adminPlayer];
  }
});
