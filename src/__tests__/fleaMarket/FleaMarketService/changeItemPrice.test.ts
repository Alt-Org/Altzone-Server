import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import FleaMarketModule from '../modules/fleaMarketModule';
import { PlayerService } from '../../../player/player.service';
import { VotingService } from '../../../voting/voting.service';
import { VotingQueue } from '../../../voting/voting.queue';
import FleaMarketBuilderFactory from '../data/fleaMarketBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import VotingBuilderFactory from '../../voting/data/voting/VotingBuilderFactory';
import { Status } from '../../../fleaMarket/enum/status.enum';

describe('FleaMarketService.changeItemPrice() test suite', () => {
  let fleaMarketService: FleaMarketService;
  let playerService: PlayerService;
  let votingService: VotingService;
  let votingQueue: VotingQueue;

  const fleaMarketItemBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto');
  const PlayerDtoBuilder = PlayerBuilderFactory.getBuilder('PlayerDto');
  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');

  const itemId = 'item';
  const playerId = 'player';
  const price = 123;

  let playerDto: any;
  let fleaMarketItemDto: any;
  let votingDto: any;
  const error = [];

  beforeEach(async () => {
    jest.clearAllMocks();
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
    playerService = await FleaMarketModule.getPlayerService();
    votingService = await FleaMarketModule.getVotingService();
    votingQueue = await FleaMarketModule.getVotingQueue();

    playerDto = PlayerDtoBuilder.setClanId('clan').build();
    fleaMarketItemDto = fleaMarketItemBuilder
      .setStatus(Status.AVAILABLE)
      .setClanId('clan')
      .build();
    votingDto = votingBuilder.build();

    jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValue([playerDto, null]);
    jest
      .spyOn(fleaMarketService.basicService, 'readOneById')
      .mockResolvedValue([fleaMarketItemDto, null]);
    jest
      .spyOn(fleaMarketService.basicService, 'updateOneById')
      .mockResolvedValue([null, null]);
    jest
      .spyOn(votingService, 'startVoting')
      .mockResolvedValue([votingDto, null]);
    jest.spyOn(votingQueue, 'addVotingCheckJob').mockImplementation();
  });

  it('should start price change voting and add job', async () => {
    const [ret, err] = await fleaMarketService.changeItemPrice(
      itemId,
      price,
      playerId,
    );
    expect(ret).toBe(votingDto);
    expect(err).toBeNull();
    expect(playerService.getPlayerById).toHaveBeenCalledWith(playerId);
    expect(fleaMarketService.basicService.readOneById).toHaveBeenCalledWith(
      itemId,
    );
    expect(fleaMarketService.basicService.updateOneById).toHaveBeenCalledWith(
      fleaMarketItemDto._id,
      { status: Status.SHIPPING },
      expect.any(Object),
    );
    expect(votingService.startVoting).toHaveBeenCalled();
    expect(votingQueue.addVotingCheckJob).toHaveBeenCalledWith(
      expect.objectContaining({ voting: votingDto, queue: expect.any(String) }),
    );
  });

  it('should return error if playerService.getPlayerById fails', async () => {
    jest.spyOn(playerService, 'getPlayerById').mockResolvedValue([null, error]);
    const [ret, err] = await fleaMarketService.changeItemPrice(
      itemId,
      price,
      playerId,
    );
    expect(ret).toBeNull();
    expect(err).toBe(error);
  });

  it('should return error if basicService.readOneById fails', async () => {
    jest
      .spyOn(fleaMarketService.basicService, 'readOneById')
      .mockResolvedValue([null, error]);
    const [ret, err] = await fleaMarketService.changeItemPrice(
      itemId,
      price,
      playerId,
    );
    expect(ret).toBeNull();
    expect(err).toBe(error);
  });

  it('should return error if item is not available', async () => {
    const unavailableItem = { ...fleaMarketItemDto, status: Status.BOOKED };
    jest
      .spyOn(fleaMarketService.basicService, 'readOneById')
      .mockResolvedValue([unavailableItem, null]);
    const [ret, err] = await fleaMarketService.changeItemPrice(
      itemId,
      price,
      playerId,
    );
    expect(ret).toBeNull();
    expect(err).toBeDefined();
  });

  it('should return error if item not authorized', async () => {
    const otherClanItem = { ...fleaMarketItemDto, clan_id: 'otherClan' };
    jest
      .spyOn(fleaMarketService.basicService, 'readOneById')
      .mockResolvedValue([otherClanItem, null]);
    const [ret, err] = await fleaMarketService.changeItemPrice(
      itemId,
      price,
      playerId,
    );
    expect(ret).toBeNull();
    expect(err).toBeDefined();
  });

  it('should return error if updateOneById fails', async () => {
    jest
      .spyOn(fleaMarketService.basicService, 'updateOneById')
      .mockResolvedValue([null, error]);
    const [ret, err] = await fleaMarketService.changeItemPrice(
      itemId,
      price,
      playerId,
    );
    expect(ret).toBeNull();
    expect(err).toBe(error);
  });

  it('should return error if votingService.startVoting fails', async () => {
    jest.spyOn(votingService, 'startVoting').mockResolvedValue([null, error]);
    const [ret, err] = await fleaMarketService.changeItemPrice(
      itemId,
      price,
      playerId,
    );
    expect(ret).toBeNull();
    expect(err).toBe(error);
  });

  it('should throw if addVotingCheckJob throws', async () => {
    jest.spyOn(votingQueue, 'addVotingCheckJob').mockImplementation(() => {
      throw new Error('addVotingCheckJob error');
    });
    jest
      .spyOn(votingService, 'startVoting')
      .mockResolvedValue([votingDto, null]);
    await expect(
      fleaMarketService.changeItemPrice(itemId, price, playerId),
    ).rejects.toThrow('addVotingCheckJob error');
  });
});
