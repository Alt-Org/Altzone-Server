import { Model } from 'mongoose';
import { ClanService } from '../../../clan/clan.service';
import JukeboxNotifier from '../../../jukebox/jukebox.notifier';
import { JukeboxQueue } from '../../../jukebox/jukebox.queue';
import { JukeboxService } from '../../../jukebox/jukebox.service';
import createMockSession from '../../common/MongooseSession/CreateMockSession';
import { Clan } from '../../../clan/clan.schema';
import createMockDataBase from '../../common/MongooseSession/CreateMockDataBase';

describe('jukeboxService.addSongToclanJukebox() test suite', () => {
  let jukeboxService: JukeboxService;
  let jukeboxNotifier: JukeboxNotifier;
  let jukeboxScheduler: JukeboxQueue;
  let clanService: ClanService;

  beforeEach(async () => {
    const mockDb = createMockDataBase();

    const mockModel = {
      db: mockDb,
    } as unknown as Model<Clan>;
    jukeboxNotifier = { songChange: jest.fn() } as any;
    jukeboxScheduler = { scheduleNextSong: jest.fn() } as any;
    clanService = {
      readOneById: jest.fn().mockResolvedValue([{ playerCount: 3 }]),
    } as any;

    createMockSession(mockModel);

    jukeboxService = new JukeboxService(
      jukeboxScheduler,
      jukeboxNotifier,
      clanService,
      mockDb as any,
    );
  });

  it('should call scheduler and notifier for first song', async () => {
    const clanId = 'clan1';
    const playerId = 'player1';
    const song = { songId: 's1', songDurationSeconds: 120 };

    await jukeboxService.addSongToClanJukebox(clanId, playerId, song);

    expect(jukeboxNotifier.songChange).toHaveBeenCalledTimes(1);
    const startTime =
      jukeboxService['clanJukeboxMap'].get(clanId).currentSong.startedAt;
    const notifiedArg = (jukeboxNotifier.songChange as jest.Mock).mock
      .calls[0][0];
    expect(notifiedArg.songId).toBe(song.songId);
    expect(notifiedArg.startedAt).toBe(startTime);
    expect(typeof notifiedArg.startedAt).toBe('number');

    expect(jukeboxScheduler.scheduleNextSong).toHaveBeenCalledWith(
      clanId,
      song.songDurationSeconds,
    );
  });

  it('should throw MORE_THAN_MAX error when player has too many songs', async () => {
    const clanId = 'clan1';
    const playerId = 'player1';
    const song = { songId: 's1', songDurationSeconds: 120 };

    const jukebox = {
      clanId,
      currentSong: null,
      songQueue: Array.from({ length: 10 }).map((_, i) => ({
        id: `song${i}`,
        playerId,
        songId: `s${i}`,
        songDurationSeconds: 120,
      })),
    };
    jukeboxService['clanJukeboxMap'].set(clanId, jukebox);

    await expect(
      jukeboxService.addSongToClanJukebox(clanId, playerId, song),
    ).rejects.toMatchObject({ reason: 'MORE_THAN_MAX' });
  });

  it('should add song to the queue', async () => {
    const clanId = 'clan1';
    const playerId = 'player1';
    const song = { songId: 's1', songDurationSeconds: 120 };

    const newJukebox = {
      clanId,
      currentSong: { ...song, startedAt: Date.now(), id: 'id1', playerId },
      songQueue: Array.from({ length: 10 }).map((_, i) => ({
        id: `song${i}`,
        playerId: `player${i}`,
        songId: `s${i}`,
        songDurationSeconds: 120,
      })),
    };
    jukeboxService['clanJukeboxMap'].set(clanId, newJukebox);

    await jukeboxService.addSongToClanJukebox(clanId, playerId, song);

    const jukebox = jukeboxService['clanJukeboxMap'].get(clanId);
    expect(jukebox.songQueue).toHaveLength(11);
  });
});
