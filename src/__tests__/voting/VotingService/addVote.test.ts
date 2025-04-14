import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import mqtt, { MqttClient } from 'mqtt';
import { ItemVoteChoice } from '../../../voting/enum/choiceType.enum';
import { PlayerService } from '../../../player/player.service';
import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import ServiceError from '../../../common/service/basicService/ServiceError';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import FleaMarketModule from '../../fleaMarket/modules/fleaMarketModule';
import PlayerModule from '../../player/modules/player.module';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('VotingService.addVote() test suite', () => {
  let votingService: VotingService;
  let playerService: PlayerService;
  let fleaMarketService: FleaMarketService;

  const votingBuilder = VotingBuilderFactory.getBuilder('CreateVotingDto');
  const playerBuilder = PlayerBuilderFactory.getBuilder('CreatePlayerDto');

  const votingModel = VotingModule.getVotingModel();
  const playerModel = PlayerModule.getPlayerModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
    playerService = await PlayerModule.getPlayerService();
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
  });

  it('Should adds a new vote to a voting if input is valid', async () => {
    const mockClient = {};

    (mqtt.connect as jest.Mock).mockReturnValue(mockClient);

    (mockClient as MqttClient).publishAsync = jest.fn((topic, payload) => {
      return Promise.resolve({
        cmd: 'publish',
        qos: 0,
        dup: false,
        retain: false,
        topic,
        payload,
      });
    });

    const fleaMarketItem = FleaMarketBuilderFactory.getBuilder(
      'CreateFleaMarketItemDto',
    ).build();

    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    await playerService.createOne(playerToCreate);
    const player = (await playerModel.findOne({ name: playerName })).toObject();

    const [fleaMarket, errorsfleaMarket] =
      await fleaMarketService.createOne(fleaMarketItem);
    expect(fleaMarket).not.toBeNull();
    expect(errorsfleaMarket).toBeNull();

    const minPercentage = 1;
    const votingToCreate = votingBuilder
      .setMinPercentage(minPercentage)
      .setType(VotingType.SELLING_ITEM)
      .setOrganizer({ player_id: player._id, clan_id: null })
      .setEntityId(fleaMarket._id.toString())
      .build();

    const [voting, errors] = await votingService.createOne(votingToCreate);
    expect(voting).not.toBeNull();
    expect(errors).toBeNull();

    await votingService.addVote(
      voting._id.toString(),
      ItemVoteChoice.YES,
      player._id.toString(),
    );

    expect(mqtt.connect).toHaveBeenCalledTimes(1);
    const votingFromDb = (
      await votingModel.findOne({ _id: voting._id })
    ).toObject();
    expect(votingFromDb.votes.length).toBe(1);
    expect(votingFromDb.votes[0].player_id).toBe(player._id.toString());
  });

  it('Should return with already voted error if try to add vote twice', async () => {
    const mockClient = {};

    (mqtt.connect as jest.Mock).mockReturnValue(mockClient);

    (mockClient as MqttClient).publishAsync = jest.fn((topic, payload) => {
      return Promise.resolve({
        cmd: 'publish',
        qos: 0,
        dup: false,
        retain: false,
        topic,
        payload,
      });
    });

    const fleaMarketItem = FleaMarketBuilderFactory.getBuilder(
      'CreateFleaMarketItemDto',
    ).build();

    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    await playerService.createOne(playerToCreate);
    const player = (await playerModel.findOne({ name: playerName })).toObject();

    const [fleaMarket, errorsfleaMarket] =
      await fleaMarketService.createOne(fleaMarketItem);
    expect(fleaMarket).not.toBeNull();
    expect(errorsfleaMarket).toBeNull();

    const minPercentage = 1;
    const votingToCreate = votingBuilder
      .setMinPercentage(minPercentage)
      .setType(VotingType.SELLING_ITEM)
      .setOrganizer({ player_id: player._id, clan_id: null })
      .setEntityId(fleaMarket._id.toString())
      .build();

    const [voting, errors] = await votingService.createOne(votingToCreate);
    expect(voting).not.toBeNull();
    expect(errors).toBeNull();

    //Add first vote
    await votingService.addVote(
      voting._id.toString(),
      ItemVoteChoice.YES,
      player._id.toString(),
    );

    expect(mqtt.connect).toHaveBeenCalledTimes(1);
    const votingFromDb = (
      await votingModel.findOne({ _id: voting._id })
    ).toObject();
    expect(votingFromDb.votes.length).toBe(1);
    expect(votingFromDb.votes[0].player_id).toBe(player._id.toString());

    //Try to add second vote
    try {
      await votingService.addVote(
        voting._id.toString(),
        ItemVoteChoice.YES,
        player._id.toString(),
      );
    } catch (error) {
      expect(error).not.toBeNull();
      expect(error).toBeInstanceOf(ServiceError);
      if (error instanceof ServiceError) {
        expect(error.message).toBe('Logged in user has already voted.');
      }
    }
  });

  it('Should return with error if input is invalid', async () => {
    const mockClient = {};

    (mqtt.connect as jest.Mock).mockReturnValue(mockClient);

    (mockClient as MqttClient).publishAsync = jest.fn((topic, payload) => {
      return Promise.resolve({
        cmd: 'publish',
        qos: 0,
        dup: false,
        retain: false,
        topic,
        payload,
      });
    });

    const fleaMarketItem = FleaMarketBuilderFactory.getBuilder(
      'CreateFleaMarketItemDto',
    ).build();

    const playerName = 'john';
    const playerToCreate = playerBuilder.setName(playerName).build();

    await playerService.createOne(playerToCreate);
    const player = (await playerModel.findOne({ name: playerName })).toObject();

    const [fleaMarket, errorsfleaMarket] =
      await fleaMarketService.createOne(fleaMarketItem);
    expect(fleaMarket).not.toBeNull();
    expect(errorsfleaMarket).toBeNull();

    const minPercentage = 1;
    const votingToCreate = votingBuilder
      .setMinPercentage(minPercentage)
      .setType(VotingType.SELLING_ITEM)
      .setOrganizer({ player_id: 'invalidId', clan_id: null }) // Invalid player ID
      .setEntityId(fleaMarket._id.toString())
      .build();

    const [voting, errors] = await votingService.createOne(votingToCreate);
    expect(voting).not.toBeNull();
    expect(errors).toBeNull();

    try {
      await votingService.addVote(
        voting._id.toString(),
        ItemVoteChoice.YES,
        player._id.toString(),
      );
    } catch (error) {
      expect(error).not.toBeNull();
      expect(error[0].message).toBe(
        'Cast to ObjectId failed for value "invalidId" (type string) at path "_id" for model "Player"',
      );
    }
  });
});
