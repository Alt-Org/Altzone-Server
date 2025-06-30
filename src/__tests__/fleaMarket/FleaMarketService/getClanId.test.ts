import { FleaMarketService } from "../../../fleaMarket/fleaMarket.service";
import FleaMarketModule from "../modules/fleaMarketModule";
import { ItemHelperService } from "../../../clanInventory/item/itemHelper.service";
import { PlayerService } from "../../../player/player.service";
import PlayerBuilderFactory from "../../player/data/playerBuilderFactory";

describe('FleaMarketService.getClanId() test suite', () => {
  let fleaMarketService: FleaMarketService;
  let itemHelperService: ItemHelperService;
  let playerService: PlayerService;
    
  const PlayerDtoBuilder = PlayerBuilderFactory.getBuilder('PlayerDto');
    const clanId = 'clan123';

    const playerDto = PlayerDtoBuilder.setClanId(clanId).build();

  beforeEach(async () => {
    jest.clearAllMocks();
    fleaMarketService = await FleaMarketModule.getFleaMarketService();
    itemHelperService = await FleaMarketModule.getItemHelperService();
    playerService = await FleaMarketModule.getPlayerService();
  });

  it('Should return with the clanId if itemClanId matches player.clan_id', async () => {
    const itemId = 'item1';
    const playerId = 'player1';
    
    const mockGetItemClanId = jest
      .spyOn(itemHelperService, 'getItemClanId')
      .mockResolvedValue([clanId, null]);
    const mockGetPlayerById = jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValue([playerDto, null]);

    const result = await fleaMarketService.getClanId(itemId, playerId);

    expect(mockGetItemClanId).toHaveBeenCalledTimes(1);
    expect(mockGetItemClanId).toHaveBeenCalledWith(itemId);
    expect(mockGetPlayerById).toHaveBeenCalledTimes(1);
    expect(mockGetPlayerById).toHaveBeenCalledWith(playerId);
    expect(result).toBe(clanId);
  });

  it('Should return with null if itemClanId does not match player.clan_id', async () => {
    const itemId = 'item2';
    const playerId = 'player2';
    const itemClanId = 'clanA';

    const mockGetItemClanId = jest
      .spyOn(itemHelperService, 'getItemClanId')
      .mockResolvedValue([itemClanId, null]);
    const mockGetPlayerById = jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValue([playerDto, null]);

    const result = await fleaMarketService.getClanId(itemId, playerId);

    expect(mockGetItemClanId).toHaveBeenCalledWith(itemId);
    expect(mockGetPlayerById).toHaveBeenCalledWith(playerId);
    expect(result).toBeNull();
  });

  it('Should throw an exception if getItemClanId returns with error', async () => {
    const itemId = 'item3';
    const playerId = 'player3';
    const error = [];

    jest
      .spyOn(itemHelperService, 'getItemClanId')
      .mockResolvedValue([null, error]);

    try {
      await fleaMarketService.getClanId(itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(err).toBe(error);
    }
  });

  it('Should throw an exception if getPlayerById returns with error', async () => {
    const itemId = 'item4';
    const playerId = 'player4';
    const clanId = 'clanX';
    const error = [];

    jest
      .spyOn(itemHelperService, 'getItemClanId')
      .mockResolvedValue([clanId, null]);
    jest
      .spyOn(playerService, 'getPlayerById')
      .mockResolvedValue([null, error]);

    try {
      await fleaMarketService.getClanId(itemId, playerId);
      fail('Expected error was not thrown');
    } catch (err) {
      expect(err).toBe(error);
    }
  });
});