import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import FleaMarketModule from '../modules/fleaMarketModule';
import { PlayerService } from '../../../player/player.service';
import FleaMarketBuilderFactory from '../data/fleaMarketBuilderFactory';
import PlayerBuilderFactory from '../../player/data/playerBuilderFactory';
import { VotingService } from '../../../voting/voting.service';
import VotingBuilderFactory from '../../voting/data/VotingBuilderFactory';
import { VotingQueue } from '../../../voting/voting.queue';
import { ClanService } from '../../../clan/clan.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import { Status } from '../../../fleaMarket/enum/status.enum';
import { notEnoughCoinsError } from '../../../fleaMarket/errors/notEnoughCoins.error';
import { itemNotAvailableError } from '../../../fleaMarket/errors/itemNotAvailable.error';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { PlayerDto } from '../../../player/dto/player.dto';
import { ClanDto } from '../../../clan/dto/clan.dto';
import { VotingDto } from '../../../voting/dto/voting.dto';
import { FleaMarketItemDto } from '../../../fleaMarket/dto/fleaMarketItem.dto';

describe('FleaMarketService.handleBuyItem() test suit', () => {
  let fleaMarketService: FleaMarketService;
  let playerService: PlayerService;
  let votingService: VotingService;
  let votingQueue: VotingQueue;
  let clanService: ClanService;
  let model: any;

  const fleaMarketItemBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto');
  const PlayerDtoBuilder = PlayerBuilderFactory.getBuilder('PlayerDto');
  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');
  const ClanDtoBuilder = ClanBuilderFactory.getBuilder('ClanDto');

  const itemId = 'item';
  const clanId = 'clan';
  const playerId = 'player';

  let playerDto: PlayerDto;
  let fleaMarketItemDto: FleaMarketItemDto;
  let votingDto: VotingDto;
  let clanDto: ClanDto;

  const error = [];
  const serviceError: ServiceError[] = [];

  let sessionMock: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
    playerService = await FleaMarketModule.getPlayerService();
    votingService = await FleaMarketModule.getVotingService();
    votingQueue = await FleaMarketModule.getVotingQueue();
    clanService = await FleaMarketModule.getClanService();

    model = fleaMarketService.model;
    playerDto = PlayerDtoBuilder.setClanId(clanId).build();
    fleaMarketItemDto = fleaMarketItemBuilder
      .setPrice(100)
      .setStatus(Status.AVAILABLE)
      .build();
    votingDto = votingBuilder.build();
    clanDto = ClanDtoBuilder.setGameCoins(200).build();

    jest.spyOn(clanService, 'readOneById').mockResolvedValue([clanDto, null]);
    jest
      .spyOn(fleaMarketService, 'readOneById')
      .mockResolvedValue([fleaMarketItemDto, null]);
    jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValue([playerDto, null]);
    jest
      .spyOn(votingService, 'startVoting')
      .mockResolvedValue([votingDto, null]);

    sessionMock = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    jest.spyOn(model, 'startSession').mockResolvedValue(sessionMock);
    jest
      .spyOn(fleaMarketService.basicService, 'updateOneById')
      .mockResolvedValue([null, null]);
    jest
      .spyOn(fleaMarketService.basicService, 'updateOne')
      .mockResolvedValue([null, null]);
  });

  it('Should process buying item and add voting check job (integration, no private mocks)', async () => {
    const addVotingCheckJob = jest
      .spyOn(votingQueue, 'addVotingCheckJob')
      .mockImplementation();
    jest.spyOn(clanService, 'updateOne').mockResolvedValue([null, null]);

    await fleaMarketService.handleBuyItem(clanId, itemId, playerId);

    expect(clanService.readOneById).toHaveBeenCalledWith(clanId, {
      includeRefs: ['Stock'],
    });
    expect(fleaMarketService.readOneById).toHaveBeenCalledWith(itemId);
    expect(playerService.getPlayerById).toHaveBeenCalledWith(playerId);
    expect(addVotingCheckJob).toHaveBeenCalledWith(
      expect.objectContaining({
        voting: votingDto,
        clanId,
        price: fleaMarketItemDto.price,
        queue: expect.any(String),
      }),
    );
  });

  it('Should throw exception if clanService.readOneById returns error', async () => {
    jest.spyOn(clanService, 'readOneById').mockResolvedValue([null, error]);
    try {
      await fleaMarketService.handleBuyItem(clanId, itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(err).toBe(error);
    }
  });

  it('Should throw exception if readOneById returns error', async () => {
    jest
      .spyOn(fleaMarketService, 'readOneById')
      .mockResolvedValue([null, error]);
    try {
      await fleaMarketService.handleBuyItem(clanId, itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(err).toBe(error);
    }
  });

  it('Should throw exception if item is not available', async () => {
    const unavailableItem = { ...fleaMarketItemDto, status: Status.BOOKED };

    jest
      .spyOn(fleaMarketService, 'readOneById')
      .mockResolvedValue([unavailableItem, null]);
    try {
      await fleaMarketService.handleBuyItem(clanId, itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(err).toBe(itemNotAvailableError);
    }
  });

  it('Should throw exception if clan does not have enough coins', async () => {
    const poorClan = { ...clanDto, gameCoins: 10 };
    jest.spyOn(clanService, 'readOneById').mockResolvedValue([poorClan, null]);
    try {
      await fleaMarketService.handleBuyItem(clanId, itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(err).toBe(notEnoughCoinsError);
    }
  });

  it('Should throw exception if playerService.getPlayerById returns error', async () => {
    jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValue([null, serviceError]);
    try {
      await fleaMarketService.handleBuyItem(clanId, itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(err).toBe(serviceError);
    }
  });

  it('Should throw if votingService.startVoting returns error (covers handleBooking branch)', async () => {
    jest
      .spyOn(votingService, 'startVoting')
      .mockResolvedValue([null, serviceError]);
    jest.spyOn(clanService, 'updateOne').mockResolvedValue([null, null]);

    try {
      await fleaMarketService.handleBuyItem(clanId, itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect(err).toBe(serviceError);
    }
  });

  it('Should throw if basicService.updateOneById fails (covers changeItemStatus branch)', async () => {
    jest
      .spyOn(fleaMarketService.basicService, 'updateOne')
      .mockResolvedValue([true, serviceError]);
    jest.spyOn(clanService, 'updateOne').mockResolvedValue([true, null]);

    try {
      await fleaMarketService.handleBuyItem(clanId, itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect(err).toBe(serviceError);
    }
  });

  it('Should throw if basicService.updateOne fails (covers reserveFunds branch)', async () => {
    const serviceError: ServiceError[] = [
      new ServiceError({ message: 'Service error' }),
    ];

    jest
      .spyOn(fleaMarketService.basicService, 'updateOne')
      .mockResolvedValue([null, serviceError]);
    jest.spyOn(clanService, 'updateOne').mockResolvedValue([null, null]);

    try {
      await fleaMarketService.handleBuyItem(clanId, itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect(err).toBeDefined();
    }
  });

  it('Should throw if clanService.updateOne fails (covers reserveFunds branch)', async () => {
    jest.spyOn(clanService, 'updateOne').mockResolvedValue([null, error]);

    try {
      await fleaMarketService.handleBuyItem(clanId, itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect(err).toBe(error);
    }
  });

  it('Should throw exception if addVotingCheckJob throws error', async () => {
    jest.spyOn(clanService, 'updateOne').mockResolvedValue([null, null]);
    jest.spyOn(votingQueue, 'addVotingCheckJob').mockImplementation(() => {
      throw serviceError;
    });

    try {
      await fleaMarketService.handleBuyItem(clanId, itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(err).toBe(serviceError);
    }
  });
});
