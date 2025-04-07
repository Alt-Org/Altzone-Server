import { Cache } from '@nestjs/cache-manager';
import { OnlinePlayersService } from '../../../onlinePlayers/onlinePlayers.service';
import OnlinePlayersModule from '../modules/onlinePlayers.module';
import { ObjectId } from 'mongodb';
import { CacheKeys } from '../../../common/enum/cacheKeys.enum';

describe('OnlinePlayersService', () => {
  let service: OnlinePlayersService;
  let cacheManager: Cache;

  beforeEach(async () => {
    service = await OnlinePlayersModule.getOnlinePlayersService();
    cacheManager = await OnlinePlayersModule.getCacheManager();
  });

  describe('addPlayerOnline', () => {
    it('should add a player to the online players list', async () => {
      const playerId = new ObjectId().toString();
      const setSpy = jest.spyOn(cacheManager, 'set');

      await service.addPlayerOnline(playerId);

      expect(setSpy).toHaveBeenCalledWith(
        `${CacheKeys.ONLINE_PLAYERS}:${playerId}`,
        '1',
        expect.objectContaining({ ttl: 300 }),
      );
    });
  });

  describe('getAllOnlinePlayers', () => {
    it('should return zero players if TTL has expired', async () => {
      const playerId = new ObjectId().toString();

      jest
        .spyOn(cacheManager, 'set')
        .mockImplementation((key, value, options: any) => {
          const ttl = options.ttl * 1000;
          const expiresAt = Date.now() + ttl;
          cacheManager.store[key] = { value, expiresAt };
          return Promise.resolve();
        });

      jest.spyOn(cacheManager.store, 'keys').mockImplementation(async () => {
        const now = Date.now();
        return Object.keys(cacheManager.store).filter(
          (key) => cacheManager.store[key].expiresAt > now,
        );
      });

      jest.spyOn(Date, 'now').mockReturnValue(0);

      await service.addPlayerOnline(playerId);

      // Mock Date.now() to simulate a time after the TTL has expired
      jest.spyOn(Date, 'now').mockReturnValue(301 * 1000); // 301 seconds later

      const result = await service.getAllOnlinePlayers();

      expect(result).toEqual([]);
    });

    it('should return all online player IDs', async () => {
      const p1 = new ObjectId().toString();
      const p2 = new ObjectId().toString();
      const p3 = new ObjectId().toString();
      const mockKeys = [p1, p2, p3];

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue(mockKeys);

      const result = await service.getAllOnlinePlayers();

      expect(result).toEqual([p1, p2, p3]);
    });
  });
});
