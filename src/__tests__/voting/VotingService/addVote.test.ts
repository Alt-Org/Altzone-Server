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
import ClanModule from '../../clan/modules/clan.module';
import ClanRoleService from '../../../clan/role/clanRole.service';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('VotingService.addVote() test suite', () => {
  let votingService: VotingService;
  let playerService: PlayerService;
  let clanRoleService: ClanRoleService;

  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');
  const votingModel = VotingModule.getVotingModel();
  const playerModel = PlayerModule.getPlayerModel();
  const fleaMarketModel = FleaMarketModule.getFleaMarketItemModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
    playerService = await PlayerModule.getPlayerService();
    clanRoleService = await ClanModule.getClanRoleService();
    (votingService as any).clanRoleService = clanRoleService;
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

    try {
      await votingService.addVote(
        voting._id.toString(),
        VoteChoice.YES,
        player._id.toString(),
      );
    } catch (error: any) {
      expect(error).toBeSE_NOT_ALLOWED();
      expect(error.message).toBe('Logged in user has already voted.');
    }
  });

  it('Should return error if organizer ID is invalid', async () => {
    const player = await createTestPlayer();
    const fleaMarket = await createTestFleaMarketItem();
    const voting = await createTestVoting(
      { player_id: 'invalidId', clan_id: null },
      fleaMarket._id.toString(),
    );

    await expect(
      votingService.addVote(
        voting._id.toString(),
        VoteChoice.YES,
        player._id.toString(),
      ),
    ).rejects.toEqual(expect.anything());
  });

  it('Should apply a clan role when a SET_CLAN_ROLE voting passes after adding a vote', async () => {
    const testId = new ObjectId().toString();
    const organizer = await playerModel.create(
      playerBuilder
        .setName(`organizer-${testId}`)
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

    await votingService.addVote(
      voting._id.toString(),
      VoteChoice.YES,
      voter._id.toString(),
    );

    const updatedPlayer = await playerModel.findById(targetPlayer._id);
    expect(updatedPlayer.clanRole_id.toString()).toBe(roleId.toString());
  });
});
