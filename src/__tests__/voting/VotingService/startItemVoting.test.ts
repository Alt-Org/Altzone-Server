import VotingBuilderFactory from '../data/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import { ObjectId } from 'mongodb';
import createMockMqttClient from '../../common/service/notificator/mocks/createMockMqttClient';

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
    jest.clearAllMocks();
    votingService = await VotingModule.getVotingService();
  });

  const createValidVotingParams = () => {
    const player = PlayerBuilderFactory.getBuilder('PlayerDto')
      .setId(new ObjectId())
      .build();

    const item =
      FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto').build();

    return votingBuilder
      .setPlayer(player)
      .setItem(item)
      .setType(VotingType.SELLING_ITEM)
      .build();
  };

  it('Should create a new voting and send MQTT notification if input is valid', async () => {
    const votingToStart = createValidVotingParams();
    const { publishAsyncMock } = createMockMqttClient('topic', 'payload');

    const [voting, errors] = await votingService.startItemVoting(votingToStart);
    const dbVoting = await votingModel.findOne({ type: votingToStart.type });

    expect(errors).toBeNull();
    expect(voting).not.toBeNull();
    expect(dbVoting).not.toBeNull();
    expect(dbVoting.type.toString()).toBe(votingToStart.type);
    expect(publishAsyncMock).toHaveBeenCalledTimes(1);
  });

  it('Should return a validation error if entity_id is invalid', async () => {
    const invalidId = 'invalidId';
    const player = PlayerBuilderFactory.getBuilder('PlayerDto')
      .setId(new ObjectId())
      .build();

    const item = FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto')
      .setId(invalidId)
      .build();

    const dto = votingBuilder
      .setPlayer(player)
      .setItem(item)
      .setType(VotingType.SELLING_ITEM)
      .build();

    createMockMqttClient('topic', 'payload');

    const [voting, errors] = await votingService.startItemVoting(dto);

    expect(voting).toBeNull();
    expect(errors).not.toBeNull();
    expect(errors[0].field).toBe('entity_id');
    expect(errors[0].value).toBe(invalidId);
  });
});
