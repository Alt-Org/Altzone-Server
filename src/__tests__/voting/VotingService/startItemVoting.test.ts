import VotingBuilderFactory from '../data/voting/VotingBuilderFactory';
import VotingModule from '../modules/voting.module';
import { VotingService } from '../../../voting/voting.service';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import FleaMarketBuilderFactory from '../../fleaMarket/data/fleaMarketBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import { ObjectId } from 'mongodb';
import createMockMqttClient from '../../common/service/notificator/mocks/createMockMqttClient';
import { VotingQueueName } from '../../../voting/enum/VotingQueue.enum';
import { ItemName } from '../../../clanInventory/item/enum/itemName.enum';

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
      .setClanId(player.clan_id.toString())
      .setItem(item)
      .setType(VotingType.FLEA_MARKET_SELL_ITEM)
      .setQueue(VotingQueueName.FLEA_MARKET)
      .build();
  };

  it('Should create a new voting and send MQTT notification if input is valid', async () => {
    const votingToStart = createValidVotingParams();
    const { publishAsyncMock } = createMockMqttClient('topic', 'payload');

    const [voting, errors] = await votingService.startVoting(votingToStart);
    const dbVoting = await votingModel.findOne({ type: votingToStart.type });

    expect(errors).toBeNull();
    expect(voting).not.toBeNull();
    expect(dbVoting).not.toBeNull();
    expect(dbVoting.type.toString()).toBe(votingToStart.type);
    expect(publishAsyncMock).toHaveBeenCalledTimes(1);
  });

  it('Should send shop item as entity when starting clan shop voting', async () => {
    const player = PlayerBuilderFactory.getBuilder('PlayerDto')
      .setId(new ObjectId())
      .build();
    const newVotingSpy = jest
      .spyOn((votingService as any).notifier, 'newVoting')
      .mockResolvedValue(undefined);

    const [voting, errors] = await votingService.startVoting({
      voterPlayer: player,
      clanId: player.clan_id.toString(),
      type: VotingType.SHOP_BUY_ITEM,
      queue: VotingQueueName.CLAN_SHOP,
      shopItem: ItemName.SOFA_TAAKKA,
    });

    expect(errors).toBeNull();
    expect(voting).not.toBeNull();
    expect(newVotingSpy).toHaveBeenCalledWith(
      voting,
      { shopItemName: ItemName.SOFA_TAAKKA },
      player,
    );
  });

  it('Should send governance payload as entity when starting governance voting', async () => {
    const player = PlayerBuilderFactory.getBuilder('PlayerDto')
      .setId(new ObjectId())
      .build();
    const governancePayload = {
      admin_idsToAdd: [new ObjectId().toString()],
      admin_idsToDelete: [],
      roles: [],
    };
    const newVotingSpy = jest
      .spyOn((votingService as any).notifier, 'newVoting')
      .mockResolvedValue(undefined);

    const [voting, errors] = await votingService.startVoting({
      voterPlayer: player,
      clanId: player.clan_id.toString(),
      type: VotingType.CLAN_GOVERNANCE_UPDATE,
      queue: VotingQueueName.CLAN_ROLE,
      governancePayload,
    });

    expect(errors).toBeNull();
    expect(voting).not.toBeNull();
    expect(newVotingSpy).toHaveBeenCalledWith(
      voting,
      governancePayload,
      player,
    );
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
      .setClanId(player.clan_id)
      .setItem(item)
      .setType(VotingType.FLEA_MARKET_SELL_ITEM)
      .build();

    createMockMqttClient('topic', 'payload');

    const [voting, errors] = await votingService.startVoting(dto);

    expect(voting).toBeNull();
    expect(errors).not.toBeNull();
    expect(errors[0].field).toBe('fleaMarketItem_id');
    expect(errors[0].value).toBe(invalidId);
  });
});
