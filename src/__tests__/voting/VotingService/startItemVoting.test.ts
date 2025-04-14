import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import mqtt, { MqttClient } from 'mqtt';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import { ObjectId } from 'mongodb';

jest.mock('mqtt', () => ({
  connect: jest.fn(),
}));

describe('VotingService.startItemVoting() test suite', () => {
  let votingService: VotingService;
  const votingBuilder = VotingBuilderFactory.getBuilder(
    'CreateStartItemVotingParamsDto',
  );

  const votingModel = VotingModule.getVotingModel();

  beforeEach(async () => {
    votingService = await VotingModule.getVotingService();
  });

  it('Should creates a new voting entry and sends a MQTT notification if input is valid', async () => {
    const player = PlayerBuilderFactory.getBuilder('PlayerDto')
      .setId(new ObjectId())
      .build();
    const fleaMarketItem =
      FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto').build();
    const votingType = VotingType.SELLING_ITEM;
    const startItemVotingParamsToCreate = votingBuilder
      .setPlayer(player)
      .setItem(fleaMarketItem)
      .setType(votingType)
      .build();

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

    const [voting, errors] = await votingService.startItemVoting(
      startItemVotingParamsToCreate,
    );

    const dbData = await votingModel.findOne({ type: votingType });

    expect(errors).toBeNull();
    expect(voting).not.toBeNull();
    expect(dbData.type.toString()).toBe(votingType.toString());
    expect(mqtt.connect).toHaveBeenCalledTimes(1);
  });

  it('Should return with an error if entity_id is invalid', async () => {
    const invalidId = 'invalidId'; // Invalid ObjectId
    const player = PlayerBuilderFactory.getBuilder('PlayerDto')
      .setId(new ObjectId())
      .build();
    const fleaMarketItem = FleaMarketBuilderFactory.getBuilder(
      'FleaMarketItemDto',
    )
      .setId(invalidId) // Invalid ObjectId
      .build();
    const votingType = VotingType.SELLING_ITEM;
    const startItemVotingParamsToCreate = votingBuilder
      .setPlayer(player)
      .setItem(fleaMarketItem)
      .setType(votingType)
      .build();

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

    const [voting, errors] = await votingService.startItemVoting(
      startItemVotingParamsToCreate,
    );

    expect(voting).toBeNull();
    expect(errors[0].field).toBe('entity_id');
    expect(errors[0].value).toBe(invalidId);
  });
});
