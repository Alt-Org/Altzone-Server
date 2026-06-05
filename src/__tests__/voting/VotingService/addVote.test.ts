import VotingBuilderFactory from '../data/voting/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import { VoteChoice } from '../../../voting/enum/choiceType.enum';
import { PlayerService } from '../../../player/player.service';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import FleaMarketModule from '../../fleaMarket/modules/fleaMarketModule';
import PlayerModule from '../../player/modules/player.module';
import createMockMqttClient from '../../common/service/notificator/mocks/createMockMqttClient';
import { ObjectId } from 'mongodb';
import { ItemName } from '../../../clanInventory/item/enum/itemName.enum';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('VotingService.addVote() test suite', () => {
  let votingService: VotingService;
  let playerService: PlayerService;

  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const votingModel = VotingModule.getVotingModel();
  const playerModel = PlayerModule.getPlayerModel();
  const fleaMarketModel = FleaMarketModule.getFleaMarketItemModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
    playerService = await PlayerModule.getPlayerService();
    createMockMqttClient('topic', 'payload');
  });

  const createTestPlayer = async () => {
    const playerToCreate = playerBuilder.setName('john').build();
    await playerService.createOne(playerToCreate);
    return (await playerModel.findOne({ name: 'john' })).toObject();
  };

  const createTestFleaMarketItem = async () => {
    const fleaMarketItem = FleaMarketBuilderFactory.getBuilder(
      'CreateFleaMarketItemDto',
    ).build();
    return await fleaMarketModel.create(fleaMarketItem);
  };

  const createTestVoting = async (organizer: any, entityId: string) => {
    const votingToCreate = votingBuilder
      .setMinPercentage(1)
      .setType(VotingType.FLEA_MARKET_SELL_ITEM)
      .setOrganizer(organizer)
      .setFleamarketItemId(entityId)
      .build();

    return await votingModel.create(votingToCreate);
  };

  it('Should add a vote successfully for a valid input', async () => {
    const player = await createTestPlayer();
    const fleaMarket = await createTestFleaMarketItem();
    const voting = await createTestVoting(
      { player_id: player._id, clan_id: null },
      fleaMarket._id.toString(),
    );
    const votingUpdatedSpy = jest
      .spyOn((votingService as any).notifier, 'votingUpdated')
      .mockResolvedValue(undefined);

    await votingService.addVote(
      voting._id.toString(),
      VoteChoice.YES,
      player._id.toString(),
    );

    const votingFromDb = (
      await votingModel.findOne({ _id: voting._id })
    ).toObject();
    expect(votingFromDb.votes).toHaveLength(1);
    expect(votingFromDb.votes[0].player_id.toString()).toBe(
      player._id.toString(),
    );
    expect(votingUpdatedSpy).toHaveBeenCalledTimes(1);
    expect((votingUpdatedSpy.mock.calls[0][1] as any)._id.toString()).toBe(
      fleaMarket._id.toString(),
    );
    expect((votingUpdatedSpy.mock.calls[0][2] as any)._id.toString()).toBe(
      player._id.toString(),
    );
  });

  it('Should not allow voting twice by the same user', async () => {
    const player = await createTestPlayer();
    const fleaMarket = await createTestFleaMarketItem();
    const voting = await createTestVoting(
      { player_id: player._id, clan_id: null },
      fleaMarket._id.toString(),
    );

    await votingService.addVote(
      voting._id.toString(),
      VoteChoice.YES,
      player._id.toString(),
    );

    await expect(
      votingService.addVote(
        voting._id.toString(),
        VoteChoice.YES,
        player._id.toString(),
      ),
    ).rejects.toMatchObject({
      message: 'Logged in user has already voted.',
    });

    const votingFromDb = await votingModel.findById(voting._id);
    expect(votingFromDb.votes).toHaveLength(1);
  });

  it('Should return error if organizer ID is invalid', async () => {
    const player = await createTestPlayer();
    const fleaMarket = await createTestFleaMarketItem();
    const voting = await createTestVoting(
      { player_id: player._id, clan_id: null },
      fleaMarket._id.toString(),
    );

    await expect(
      votingService.addVote(voting._id.toString(), VoteChoice.YES, 'invalidId'),
    ).rejects.toEqual(expect.anything());
  });

  it('Should send shop item entity when adding a vote to clan shop voting', async () => {
    const testId = new ObjectId().toString().slice(-6);
    const organizer = await playerModel.create(
      playerBuilder
        .setName(`shop-org-${testId}`)
        .setUniqueIdentifier(`shop-organizer-${testId}`)
        .build(),
    );
    const voter = await playerModel.create(
      playerBuilder
        .setName(`shop-voter-${testId}`)
        .setUniqueIdentifier(`shop-voter-${testId}`)
        .build(),
    );
    const voting = await votingModel.create({
      organizer: {
        player_id: organizer._id,
        clan_id: new ObjectId(),
      },
      endsOn: new Date(Date.now() + 3600000),
      type: VotingType.SHOP_BUY_ITEM,
      minPercentage: 101,
      votes: [],
      shopItemName: ItemName.SOFA_TAAKKA,
    });
    const votingUpdatedSpy = jest
      .spyOn((votingService as any).notifier, 'votingUpdated')
      .mockResolvedValue(undefined);

    await votingService.addVote(
      voting._id.toString(),
      VoteChoice.NO,
      voter._id.toString(),
    );

    expect(votingUpdatedSpy).toHaveBeenCalledTimes(1);
    expect(votingUpdatedSpy.mock.calls[0][1]).toEqual({
      shopItemName: ItemName.SOFA_TAAKKA,
    });
    expect((votingUpdatedSpy.mock.calls[0][2] as any)._id.toString()).toBe(
      voter._id.toString(),
    );
  });

  it('Should send governance payload entity when adding a vote to governance voting', async () => {
    const testId = new ObjectId().toString().slice(-6);
    const organizer = await playerModel.create(
      playerBuilder
        .setName(`gov-org-${testId}`)
        .setUniqueIdentifier(`gov-organizer-${testId}`)
        .build(),
    );
    const voter = await playerModel.create(
      playerBuilder
        .setName(`gov-voter-${testId}`)
        .setUniqueIdentifier(`gov-voter-${testId}`)
        .build(),
    );
    const governancePayload = {
      admin_idsToAdd: [new ObjectId().toString()],
      admin_idsToDelete: [],
      roles: [],
    };
    const voting = await votingModel.create({
      organizer: {
        player_id: organizer._id,
        clan_id: new ObjectId(),
      },
      endsOn: new Date(Date.now() + 3600000),
      type: VotingType.CLAN_GOVERNANCE_UPDATE,
      minPercentage: 101,
      votes: [],
      governancePayload,
    });
    const votingUpdatedSpy = jest
      .spyOn((votingService as any).notifier, 'votingUpdated')
      .mockResolvedValue(undefined);

    await votingService.addVote(
      voting._id.toString(),
      VoteChoice.NO,
      voter._id.toString(),
    );

    expect(votingUpdatedSpy).toHaveBeenCalledTimes(1);
    expect(votingUpdatedSpy.mock.calls[0][1]).toEqual(governancePayload);
    expect((votingUpdatedSpy.mock.calls[0][2] as any)._id.toString()).toBe(
      voter._id.toString(),
    );
  });

  it('Should apply a clan role when a SET_CLAN_ROLE voting passes after adding a vote', async () => {
    const testId = new ObjectId().toString().slice(-6);
    const organizer = await playerModel.create(
      playerBuilder
        .setName(`org-${testId}`)
        .setUniqueIdentifier(`organizer-${testId}`)
        .build(),
    );
    const voter = await playerModel.create(
      playerBuilder
        .setName(`voter-${testId}`)
        .setUniqueIdentifier(`voter-${testId}`)
        .build(),
    );
    const targetPlayer = await playerModel.create(
      playerBuilder
        .setName(`target-${testId}`)
        .setUniqueIdentifier(`target-${testId}`)
        .build(),
    );
    const roleId = new ObjectId();

    const voting = await votingModel.create({
      organizer: {
        player_id: organizer._id,
        clan_id: new ObjectId(),
      },
      endsOn: new Date(Date.now() + 3600000),
      type: VotingType.SET_CLAN_ROLE,
      minPercentage: 51,
      votes: [{ player_id: organizer._id, choice: VoteChoice.YES }],
      setClanRole: {
        player_id: targetPlayer._id,
        role_id: roleId,
      },
    });
    const votingUpdatedSpy = jest
      .spyOn((votingService as any).notifier, 'votingUpdated')
      .mockResolvedValue(undefined);

    await votingService.addVote(
      voting._id.toString(),
      VoteChoice.YES,
      voter._id.toString(),
    );

    const updatedPlayer = await playerModel.findById(targetPlayer._id);
    expect(updatedPlayer.clanRole_id.toString()).toBe(roleId.toString());
    expect(votingUpdatedSpy).toHaveBeenCalledTimes(1);
    expect(votingUpdatedSpy).toHaveBeenCalledTimes(1);

    const notificationEntity = votingUpdatedSpy.mock.calls[0]?.[1];
    if (!notificationEntity) {
      throw new Error(
        `votingUpdated not called correctly. Calls: ${JSON.stringify(votingUpdatedSpy.mock.calls)}`,
      );
    }

    expect((notificationEntity as any).player_id.toString()).toEqual(
      targetPlayer._id.toString(),
    );

    expect((notificationEntity as any).role_id.toString()).toEqual(
      roleId.toString(),
    );

    expect((votingUpdatedSpy.mock.calls[0][2] as any)._id.toString()).toBe(
      voter._id.toString(),
    );
  });
});
