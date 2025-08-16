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
import GroupAdminBuilder from '../data/groupAdmin/GroupAdminBuilder';
import ProfileBuilder from '../../profile/data/profile/profileBuilder';
import PlayerBuilder from '../../player/data/player/playerBuilder';
import ClanBuilder from '../../clan/data/clan/ClanBuilder';
import SoulHomeBuilder from '../../clanInventory/data/soulhome/SoulHomeBuilder';
import RoomBuilder from '../../clanInventory/data/room/RoomBuilder';
import StockBuilder from '../../clanInventory/data/stock/StockBuilder';
import ItemModule from '../../clanInventory/modules/item.module';
import CustomCharacterModule from '../../player/modules/customCharacter.module';
import VotingModule from '../../voting/modules/voting.module';
import FleaMarketModule from '../../fleaMarket/modules/fleaMarketModule';
import DailyTasksModule from '../../dailyTasks/modules/dailyTasks.module';
import BoxBuilder from '../data/box/BoxBuilder';
import ChatModule from '../../chat/modules/chat.module';
import GameDataModule from '../../gameData/modules/gameData.module';
import FeedbackModule from '../../feedback/modules/feedback.module';
import ItemBuilder from '../../clanInventory/data/item/ItemBuilder';
import FleaMarketItemBuilder from '../../fleaMarket/data/fleaMarket/FleaMarketItemBuilder';
import CustomCharacterBuilder from '../../player/data/customCharacter/CustomCharacterBuilder';
import ChatMessageBuilder from '../../chat/data/builder/chatMessageBuilder';
import { GameBuilder } from '../../gameData/data/gameData/GameBuilder';
import { FeedbackBuilder } from '../../feedback/data/feedback/FeedbackBuilder';
import VotingBuilderFactory from '../../voting/data/voting/VotingBuilderFactory';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import ChatBuilderFactory from '../../chat/data/chatBuilderFactory';
import GameDataBuilderFactory from '../../gameData/data/gameDataBuilderFactory';
import FeedbackBuilderFactory from '../../feedback/data/feedbackBuilderFactory';
import DailyTaskBuilder from '../../dailyTasks/data/dailyTasks/DailyTaskBuilder';
import { GroupAdmin } from '../../../box/groupAdmin/groupAdmin.schema';
import { Profile } from '../../../profile/profile.schema';
import { Player } from '../../../player/schemas/player.schema';
import { Model } from 'mongoose';
import { SessionStage } from '../../../box/enum/SessionStage.enum';
import DailyTaskBuilderFactory from '../../dailyTasks/data/dailyTaskBuilderFactory';
import { getNonExisting_id } from '../../test_utils/util/getNonExisting_id';
import { VotingBuilder } from '../../voting/data/voting/VotingBuilder';

describe('BoxService.reset() test suite', () => {
  process.env.ENVIRONMENT = Environment.TESTING_SESSION;
  envVars.ENVIRONMENT = Environment.TESTING_SESSION;

  let boxService: BoxService;
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
  const characterModel = CustomCharacterModule.getCustomCharacterModel();
  let characterBuilder: CustomCharacterBuilder;

  const votingModel = VotingModule.getVotingModel();
  let votingBuilder: VotingBuilder;
  const fleaMarketModel = FleaMarketModule.getFleaMarketItemModel();
  let fleaMarketBuilder: FleaMarketItemBuilder;
  const taskModel = DailyTasksModule.getDailyTaskModel();
  let taskBuilder: DailyTaskBuilder;
  const chatModel = ChatModule.getChatModel();
  let chatBuilder: ChatMessageBuilder;
  const gameModel = GameDataModule.getGameModel();
  let gameBuilder: GameBuilder;

  const boxModel = BoxModule.getBoxModel();
  let boxBuilder: BoxBuilder;
  const adminModel = BoxModule.getGroupAdminModel();
  let adminBuilder: GroupAdminBuilder;
  const feedbackModel = FeedbackModule.getFeedbackModel();
  let feedbackBuilder: FeedbackBuilder;

  beforeEach(async () => {
    boxService = await BoxModule.getBoxService();
    initAllBuilders();
    [box, admin, adminProfile, adminPlayer] = await createBoxAndAdmin();
  });

  it('Should return true if all box related data was removed', async () => {
    const clan1 = clanBuilder.setName('clan1').build();
    const clan2 = clanBuilder.setName('clan2').build();
    const [clan_ids] = await createBoxInstances(clanModel, [clan1, clan2]);

    const profile1 = profileBuilder.setUsername('profile1').build();
    const profile2 = profileBuilder.setUsername('profile2').build();
    const [profile_ids] = await createBoxInstances(profileModel, [
      profile1,
      profile2,
    ]);

    const [isRemoved, errors] = await boxService.reset(box._id);

    await expectDataIsRemoved(clanModel, clan_ids);
    await expectDataIsRemoved(profileModel, profile_ids);
    expect(errors).toBeNull();
    expect(isRemoved).toBe(true);
  });

  it('Should return true if there are no box related data after stage 2', async () => {
    const [isRemoved, errors] = await boxService.reset(box._id);

    expect(errors).toBeNull();
    expect(isRemoved).toBe(true);
  });

  it('Should delete all box related clans from DB', async () => {
    const clan1 = clanBuilder.setName('clan1').build();
    const clan2 = clanBuilder.setName('clan2').build();
    const [clan_ids] = await createBoxInstances(clanModel, [clan1, clan2]);

    await boxService.reset(box._id);

    await expectDataIsRemoved(clanModel, clan_ids);
  });

  it('Should delete all box related clan inventory data from DB', async () => {
    const soulHome = soulHomeBuilder
      .setClanId(new ObjectId().toString())
      .build();
    const room = roomBuilder.setSoulHomeId(new ObjectId().toString()).build();
    const stock = stockBuilder.setClanId(new ObjectId()).build();
    const item1 = itemBuilder.setRoomId(new ObjectId()).build();
    const item2 = itemBuilder.setRoomId(new ObjectId()).build();

    const [soulHome_ids] = await createBoxInstances(soulHomeModel, [soulHome]);
    const [room_ids] = await createBoxInstances(roomModel, [room]);
    const [stock_ids] = await createBoxInstances(stockModel, [stock]);
    const [item_ids] = await createBoxInstances(itemModel, [item1, item2]);

    await boxService.reset(box._id);

    await expectDataIsRemoved(soulHomeModel, soulHome_ids);
    await expectDataIsRemoved(roomModel, room_ids);
    await expectDataIsRemoved(stockModel, stock_ids);
    await expectDataIsRemoved(itemModel, item_ids);
  });

  it('Should delete all box related testers players and profiles from DB', async () => {
    const profile1 = profileBuilder.setUsername('user1').build();
    const profile2 = profileBuilder.setUsername('user2').build();
    const player1 = playerBuilder
      .setName('player1')
      .setUniqueIdentifier('player1')
      .build();
    const player2 = playerBuilder
      .setName('player2')
      .setUniqueIdentifier('player2')
      .build();
    const [profile_ids] = await createBoxInstances(profileModel, [
      profile1,
      profile2,
    ]);
    const [player_ids] = await createBoxInstances(playerModel, [
      player1,
      player2,
    ]);

    await boxService.reset(box._id);

    await expectDataIsRemoved(profileModel, profile_ids);
    await expectDataIsRemoved(playerModel, player_ids);
  });

  it('Should delete all box related custom characters from DB', async () => {
    const character1 = characterBuilder.setPlayerId(new ObjectId()).build();
    const character2 = characterBuilder.setPlayerId(new ObjectId()).build();

    const [character_ids] = await createBoxInstances(characterModel, [
      character1,
      character2,
    ]);

    await boxService.reset(box._id);

    await expectDataIsRemoved(characterModel, character_ids);
  });

  it('Should delete all box related chat messages from DB', async () => {
    const message1 = chatBuilder.setSenderId(new ObjectId()).build();
    const message2 = chatBuilder.setSenderId(new ObjectId()).build();

    const [message_ids] = await createBoxInstances(chatModel, [
      message1,
      message2,
    ]);

    await boxService.reset(box._id);

    await expectDataIsRemoved(chatModel, message_ids);
  });

  it('Should delete all box related games data from DB', async () => {
    const game1 = gameBuilder.build();
    const game2 = gameBuilder.build();

    const [game_ids] = await createBoxInstances(gameModel, [game1, game2]);

    await boxService.reset(box._id);

    await expectDataIsRemoved(gameModel, game_ids);
  });

  it('Should delete all box related daily tasks from DB', async () => {
    const task1 = taskBuilder.setClanId(new ObjectId()).build();
    const task2 = taskBuilder.setClanId(new ObjectId()).build();

    const [task_ids] = await createBoxInstances(taskModel, [task1, task2]);

    await boxService.reset(box._id);

    await expectDataIsRemoved(taskModel, task_ids);
  });

  it('Should delete all box related flea market items from DB', async () => {
    const item1 = fleaMarketBuilder.build();
    const item2 = fleaMarketBuilder.build();

    const [item_ids] = await createBoxInstances(fleaMarketModel, [
      item1,
      item2,
    ]);

    await boxService.reset(box._id);

    await expectDataIsRemoved(fleaMarketModel, item_ids);
  });

  it('Should delete all box related votings from DB', async () => {
    const vote1 = votingBuilder.build();
    const vote2 = votingBuilder.build();

    const [vote_ids] = await createBoxInstances(votingModel, [vote1, vote2]);

    await boxService.reset(box._id);

    await expectDataIsRemoved(votingModel, vote_ids);
  });

  it('Should not delete box from DB', async () => {
    await boxService.reset(box._id);

    const boxInDB = await boxModel.findById(box._id);
    expect(boxInDB).not.toBeNull();
  });

  it('Should not delete admin group from DB', async () => {
    await boxService.reset(box._id);

    const adminInDB = await adminModel.findById(admin._id);
    expect(adminInDB).not.toBeNull();
  });

  it('Should not delete admin group player from DB', async () => {
    await boxService.reset(box._id);

    const adminPlayerInDB = await playerModel.findById(adminPlayer._id);
    expect(adminPlayerInDB).not.toBeNull();
  });

  it('Should not delete admin group profile from DB', async () => {
    await boxService.reset(box._id);

    const adminProfileInDB = await profileModel.findById(adminProfile._id);
    expect(adminProfileInDB).not.toBeNull();
  });

  it('Should not delete testers feedbacks from DB', async () => {
    const feedback1 = feedbackBuilder.build();
    const feedback2 = feedbackBuilder.build();

    const [feedback_ids] = await createBoxInstances(feedbackModel, [
      feedback1,
      feedback2,
    ]);

    await boxService.reset(box._id);

    const feedbacksAmount = await getInstancesAmount(
      feedbackModel,
      feedback_ids,
    );

    expect(feedbacksAmount).toBe(2);
  });

  it('Should not delete data related to other box from DB', async () => {
    const otherBox_ids = new ObjectId();

    const clan1 = clanBuilder.setName('clan1').build();
    const clan2 = clanBuilder.setName('clan2').build();
    const [clan_ids] = await createBoxInstances(
      clanModel,
      [clan1, clan2],
      otherBox_ids,
    );

    const profile1 = profileBuilder.setUsername('profile1').build();
    const profile2 = profileBuilder.setUsername('profile2').build();
    const [profile_ids] = await createBoxInstances(
      profileModel,
      [profile1, profile2],
      otherBox_ids,
    );

    await boxService.reset(box._id);

    const clansAmount = await getInstancesAmount(clanModel, clan_ids);
    const profilesAmount = await getInstancesAmount(profileModel, profile_ids);

    expect(clansAmount).toBe(2);
    expect(profilesAmount).toBe(2);
  });

  it('Should set box sessionStage to stage 2 in DB', async () => {
    await boxService.reset(box._id);

    const boxInDB = await boxModel.findById(box._id);
    expect(boxInDB.sessionStage).toBe(SessionStage.PREPARING);
  });

  it('Should return ServiceError NOT_FOUND if there are no box with this _id', async () => {
    const [isReset, errors] = await boxService.reset(getNonExisting_id());

    expect(isReset).toBeNull();
    expect(errors).toContainSE_NOT_FOUND();
  });

  it('Should return ServiceError REQUIRED if the box_id is null', async () => {
    const [isReset, errors] = await boxService.reset(null);

    expect(isReset).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return ServiceError REQUIRED if the box_id is undefined', async () => {
    const [isReset, errors] = await boxService.reset(undefined);

    expect(isReset).toBeNull();
    expect(errors).toContainSE_REQUIRED();
  });

  it('Should return ServiceError REQUIRED if the box_id is empty string', async () => {
    const [isReset, errors] = await boxService.reset('');

    expect(isReset).toBeNull();
    expect(errors).toContainSE_REQUIRED();
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
    characterBuilder = PlayerBuilderFactory.getBuilder('CustomCharacter');

    votingBuilder = VotingBuilderFactory.getBuilder('Voting');
    fleaMarketBuilder = FleaMarketBuilderFactory.getBuilder('FleaMarketItem');
    taskBuilder = DailyTaskBuilderFactory.getBuilder('DailyTask');
    chatBuilder = ChatBuilderFactory.getBuilder('ChatMessage');
    gameBuilder = GameDataBuilderFactory.getBuilder('Game');

    boxBuilder = BoxBuilderFactory.getBuilder('Box');
    adminBuilder = BoxBuilderFactory.getBuilder('GroupAdmin');
    feedbackBuilder = FeedbackBuilderFactory.getBuilder('Feedback');
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
