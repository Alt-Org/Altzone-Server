import { FleaMarketService } from '../../../fleaMarket/fleaMarket.service';
import FleaMarketModule from '../modules/fleaMarketModule';
import { VotingService } from '../../../voting/voting.service';
import VotingBuilderFactory from '../../voting/data/VotingBuilderFactory';
import { ClanService } from '../../../clan/clan.service';
import ClanBuilderFactory from '../../clan/data/clanBuilderFactory';
import FleaMarketBuilderFactory from '../data/fleaMarketBuilderFactory';
import { Status } from '../../../fleaMarket/enum/status.enum';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { ObjectId } from 'mongodb';
import { VotingType } from '../../../voting/enum/VotingType.enum';
import { ItemService } from '../../../clanInventory/item/item.service';
import { FleaMarketHelperService } from '../../../fleaMarket/fleaMarketHelper.service';
import { CreateItemDto } from '../../../clanInventory/item/dto/createItem.dto';
import ClanInventoryBuilderFactory from '../../clanInventory/data/clanInventoryBuilderFactory';
import { ItemDto } from '../../../clanInventory/item/dto/item.dto';
import BasicService from '../../../common/service/basicService/BasicService';
import { VotingDto } from '../../../voting/dto/voting.dto';
import { ClanDto } from '../../../clan/dto/clan.dto';
import { FleaMarketItemDto } from '../../../fleaMarket/dto/fleaMarketItem.dto';

describe('FleaMarketService.checkVotingOnExpire() test suit', () => {
  let fleaMarketService: FleaMarketService;
  let votingService: VotingService;
  let clanService: ClanService;
  let basicService: BasicService;
  let model: any;
  let itemService: ItemService;
  let helperService: FleaMarketHelperService;

  const votingBuilder = VotingBuilderFactory.getBuilder('VotingDto');
  const ClanDtoBuilder = ClanBuilderFactory.getBuilder('ClanDto');
  const fleaMarketItemBuilder =
    FleaMarketBuilderFactory.getBuilder('FleaMarketItemDto');
  const createItemDtoBuilder =
    ClanInventoryBuilderFactory.getBuilder('CreateItemDto');
  const itemDtoBuilder = ClanInventoryBuilderFactory.getBuilder('ItemDto');

  let votingDto: VotingDto;
  let clanDto: ClanDto;
  let fleaMarketItemDto: FleaMarketItemDto;
  let params: any;
  let error: ServiceError;
  let sessionMock: any;
  let createItemDto: CreateItemDto;
  let itemDto: ItemDto;

  beforeEach(async () => {
    jest.clearAllMocks();
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
    votingService = await FleaMarketModule.getVotingService();
    clanService = await FleaMarketModule.getClanService();
    basicService = fleaMarketService.basicService;
    model = fleaMarketService.model;

    itemService = await FleaMarketModule.getItemService();
    helperService = await FleaMarketModule.getFleaMarketHelperService();

    votingDto = votingBuilder.build();
    clanDto = ClanDtoBuilder.setGameCoins(200).setStockCount(50).build();

    fleaMarketItemDto = fleaMarketItemBuilder
      .setStatus(Status.BOOKED)
      .setPrice(100)
      .build();
    createItemDto = createItemDtoBuilder.build();
    itemDto = itemDtoBuilder.build();

    error = new ServiceError({ message: 'test error' });

    params = {
      voting: votingDto,
      price: 100,
      clanId: clanDto._id,
      stockId: new ObjectId(),
      fleaMarketItemId: fleaMarketItemDto._id,
    };

    sessionMock = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    jest.spyOn(model.db, 'startSession').mockResolvedValue(sessionMock);

    jest
      .spyOn(basicService, 'readOneById')
      .mockResolvedValue([fleaMarketItemDto, null]);

    jest.spyOn(basicService, 'updateOneById').mockResolvedValue([null, null]);
  });

  it('Should process voting expiration and update item/clan (voting PASSED, BUY)', async () => {
    params.voting.type = VotingType.FLEA_MARKET_BUY_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(true);
    jest
      .spyOn(votingService.basicService, 'deleteOneById')
      .mockResolvedValue([null, null]);
    jest
      .spyOn(fleaMarketService, 'readOneById')
      .mockResolvedValue([fleaMarketItemDto, null]);
    jest.spyOn(clanService, 'readOneById').mockResolvedValue([clanDto, null]);
    jest.spyOn(basicService, 'deleteOneById').mockResolvedValue([null, null]);
    jest.spyOn(clanService, 'updateOne').mockResolvedValue([null, null]);
    jest
      .spyOn(helperService, 'fleaMarketItemToCreateItemDto')
      .mockResolvedValue(createItemDto as never);
    jest.spyOn(itemService, 'createOne').mockResolvedValue([itemDto, null]);

    await fleaMarketService.checkVotingOnExpire(params);

    expect(votingService.checkVotingSuccess).toHaveBeenCalledWith(
      params.voting,
    );
    expect(sessionMock.startTransaction).toHaveBeenCalled();
    expect(sessionMock.commitTransaction).toHaveBeenCalled();
    expect(sessionMock.endSession).toHaveBeenCalled();
    expect(votingService.basicService.deleteOneById).toHaveBeenCalledWith(
      params.voting._id,
    );
  });

  it('Should throw exception if handlePassedBuyVoting dependency throws | itemService.createOne', async () => {
    params.voting.type = VotingType.FLEA_MARKET_BUY_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(true);
    jest
      .spyOn(fleaMarketService, 'readOneById')
      .mockResolvedValue([fleaMarketItemDto, null]);
    jest.spyOn(clanService, 'readOneById').mockResolvedValue([clanDto, null]);
    jest.spyOn(clanService, 'updateOne').mockResolvedValue([null, null]);
    jest
      .spyOn(helperService, 'fleaMarketItemToCreateItemDto')
      .mockResolvedValue(createItemDto as never);
    jest.spyOn(itemService, 'createOne').mockResolvedValue([null, [error]]);

    try {
      await fleaMarketService.checkVotingOnExpire(params);
    } catch (error) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect((error as ServiceError)[0].message).toBe('test error');
    }
  });

  it('Should throw exception if handlePassedBuyVoting dependency throws | basicService.deleteOneById', async () => {
    params.voting.type = VotingType.FLEA_MARKET_BUY_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(true);
    jest
      .spyOn(fleaMarketService, 'readOneById')
      .mockResolvedValue([fleaMarketItemDto, null]);
    jest.spyOn(clanService, 'readOneById').mockResolvedValue([clanDto, null]);
    jest.spyOn(clanService, 'updateOne').mockResolvedValue([null, null]);
    jest
      .spyOn(helperService, 'fleaMarketItemToCreateItemDto')
      .mockResolvedValue(createItemDto as never);
    jest.spyOn(itemService, 'createOne').mockResolvedValue([itemDto, null]);
    jest
      .spyOn(basicService, 'deleteOneById')
      .mockResolvedValue([null, [error]]);

    try {
      await fleaMarketService.checkVotingOnExpire(params);
    } catch (error) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect((error as ServiceError)[0].message).toBe('test error');
    }
  });

  it('Should process voting expiration and update item/clan (voting REJECTED, BUY)', async () => {
    params.voting.type = VotingType.FLEA_MARKET_BUY_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(false);
    jest
      .spyOn(votingService.basicService, 'deleteOneById')
      .mockResolvedValue([null, null]);
    jest
      .spyOn(fleaMarketService, 'readOneById')
      .mockResolvedValue([fleaMarketItemDto, null]);
    jest.spyOn(clanService, 'readOneById').mockResolvedValue([clanDto, null]);
    jest.spyOn(clanService, 'updateOne').mockResolvedValue([null, null]);

    await fleaMarketService.checkVotingOnExpire(params);

    expect(votingService.checkVotingSuccess).toHaveBeenCalledWith(
      params.voting,
    );
    expect(clanService.readOneById).toHaveBeenCalledWith(params.clanId);
    expect(basicService.updateOneById).toHaveBeenCalled();
    expect(clanService.updateOne).toHaveBeenCalled();
    expect(sessionMock.startTransaction).toHaveBeenCalled();
    expect(sessionMock.commitTransaction).toHaveBeenCalled();
    expect(sessionMock.endSession).toHaveBeenCalled();
    expect(votingService.basicService.deleteOneById).toHaveBeenCalledWith(
      params.voting._id,
    );
  });

  it('Should process voting expiration and update item/clan (voting PASSED, SELL)', async () => {
    params.voting.type = VotingType.FLEA_MARKET_SELL_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(true);
    jest
      .spyOn(votingService.basicService, 'deleteOneById')
      .mockResolvedValue([null, null]);
    jest
      .spyOn(fleaMarketService, 'readOneById')
      .mockResolvedValue([fleaMarketItemDto, null]);

    await fleaMarketService.checkVotingOnExpire(params);

    expect(votingService.checkVotingSuccess).toHaveBeenCalledWith(
      params.voting,
    );
    expect(basicService.updateOneById).toHaveBeenCalled();
    expect(votingService.basicService.deleteOneById).toHaveBeenCalledWith(
      params.voting._id,
    );
  });

  it('Should process voting expiration and update item/clan (voting REJECTED, SELL)', async () => {
    params.voting.type = VotingType.FLEA_MARKET_SELL_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(false);
    jest
      .spyOn(votingService.basicService, 'deleteOneById')
      .mockResolvedValue([null, null]);
    jest
      .spyOn(fleaMarketService, 'readOneById')
      .mockResolvedValue([fleaMarketItemDto, null]);
    jest.spyOn(basicService, 'deleteOneById').mockResolvedValue([null, null]);
    jest
      .spyOn(helperService, 'fleaMarketItemToCreateItemDto')
      .mockResolvedValue(createItemDto as never);
    jest.spyOn(itemService, 'createOne').mockResolvedValue([itemDto, null]);

    await fleaMarketService.checkVotingOnExpire(params);

    expect(votingService.checkVotingSuccess).toHaveBeenCalledWith(
      params.voting,
    );
    expect(basicService.readOneById).toHaveBeenCalled();
    expect(sessionMock.startTransaction).toHaveBeenCalled();
    expect(sessionMock.commitTransaction).toHaveBeenCalled();
    expect(sessionMock.endSession).toHaveBeenCalled();
    expect(votingService.basicService.deleteOneById).toHaveBeenCalledWith(
      params.voting._id,
    );
  });

  it('Should throw exception if handleRejectedSellVoting dependency throws | itemService.createOne', async () => {
    params.voting.type = VotingType.FLEA_MARKET_SELL_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(false);
    jest
      .spyOn(fleaMarketService, 'readOneById')
      .mockResolvedValue([fleaMarketItemDto, null]);
    jest
      .spyOn(helperService, 'fleaMarketItemToCreateItemDto')
      .mockResolvedValue(createItemDto as never);
    jest
      .spyOn(itemService, 'createOne')
      .mockResolvedValue([null, [error, error]]);

    try {
      await fleaMarketService.checkVotingOnExpire(params);
    } catch (error) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect((error as ServiceError)[0].message).toBe('test error');
    }
  });

  it('Should throw exception if handlePassedBuyVoting dependency throws | baseService.readOneById', async () => {
    params.voting.type = VotingType.FLEA_MARKET_BUY_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(true);
    jest.spyOn(basicService, 'readOneById').mockResolvedValue([null, [error]]);

    try {
      await fleaMarketService.checkVotingOnExpire(params);
    } catch (error) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect((error as ServiceError)[0].message).toBe('test error');
    }
  });

  it('Should throw exception if handleRejectedBuyVoting dependency throws | basicService.updateOneById', async () => {
    params.voting.type = VotingType.FLEA_MARKET_BUY_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(false);
    jest
      .spyOn(basicService, 'updateOneById')
      .mockResolvedValue([null, [error]]);

    try {
      await fleaMarketService.checkVotingOnExpire(params);
    } catch (error) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect((error as ServiceError)[0].message).toBe('test error');
    }
  });

  it('Should throw if handleRejectedBuyVoting dependency throws | clanService.readOneById', async () => {
    params.voting.type = VotingType.FLEA_MARKET_BUY_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(false);
    jest.spyOn(clanService, 'readOneById').mockResolvedValue([null, [error]]);

    try {
      await fleaMarketService.checkVotingOnExpire(params);
    } catch (error) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect((error as ServiceError)[0].message).toBe('test error');
    }
  });

  it('Should throw if handleRejectedBuyVoting dependency throws | clanService.updateOne', async () => {
    params.voting.type = VotingType.FLEA_MARKET_BUY_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(false);
    jest.spyOn(clanService, 'readOneById').mockResolvedValue([clanDto, null]);
    jest.spyOn(clanService, 'updateOne').mockResolvedValue([null, [error]]);

    try {
      await fleaMarketService.checkVotingOnExpire(params);
    } catch (error) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect((error as ServiceError[])[0].message).toBe('test error');
    }
  });

  it('Should throw exception if handlePassedSellVoting dependency throws | basicService.updateOneById', async () => {
    params.voting.type = VotingType.FLEA_MARKET_SELL_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(true);
    jest
      .spyOn(basicService, 'updateOneById')
      .mockResolvedValue([null, [error]]);
    try {
      await fleaMarketService.checkVotingOnExpire(params);
    } catch (error) {
      expect((error as ServiceError)[0].message).toBe('test error');
    }
  });

  it('Should throw exception if handleRejectedSellVoting dependency throws | basicService.readOneById', async () => {
    params.voting.type = VotingType.FLEA_MARKET_SELL_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(false);
    jest.spyOn(basicService, 'readOneById').mockResolvedValue([null, [error]]);

    try {
      await fleaMarketService.checkVotingOnExpire(params);
    } catch (error) {
      expect((error as ServiceError)[0].message).toBe('test error');
    }
  });

  it('Should throw exception if handleRejectedSellVoting dependency throws | basicService.deleteOneById', async () => {
    params.voting.type = VotingType.FLEA_MARKET_SELL_ITEM;

    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(false);
    jest
      .spyOn(basicService, 'deleteOneById')
      .mockResolvedValue([null, [error]]);

    try {
      await fleaMarketService.checkVotingOnExpire(params);
    } catch (error) {
      expect(sessionMock.abortTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
      expect((error as ServiceError)[0].message).toBe('test error');
    }
  });

  it('Should throw exception if voting type is unknown', async () => {
    params.voting.type = -1;
    
    jest.spyOn(votingService, 'checkVotingSuccess').mockResolvedValue(true);

    try {
      await fleaMarketService.checkVotingOnExpire(params);
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceError);
      expect((error as ServiceError).message).toBe('Unknown voting type');
    }
  });
});
