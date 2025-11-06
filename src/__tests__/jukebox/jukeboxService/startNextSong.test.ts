import { ClanService } from '../../../clan/clan.service';
import JukeboxNotifier from '../../../jukebox/jukebox.notifier';
import { JukeboxService } from '../../../jukebox/jukebox.service';

describe('jukeboxService.startNextSong() test suite', () => {
  let jukeboxService: JukeboxService;
  let jukeboxNotifier: JukeboxNotifier;
  let clanService: ClanService;

  beforeEach(async () => {
    jukeboxNotifier = { songChange: jest.fn() } as any;
    clanService = {
      readOneById: jest.fn().mockResolvedValue([{ playerCount: 3 }]),
    } as any;

    jukeboxService = new JukeboxService(jukeboxNotifier, clanService);
  });

  it('should start next song', async () => {
    const clanId = 'clan1';
    const oldCurrentSong = {
      id: 'oldId',
      playerId: 'oldP',
      songId: 'oldS',
      songDurationSeconds: 10,
      startedAt: 3,
    };

    const jukebox = {
      clanId,
      currentSong: oldCurrentSong,
      songQueue: Array.from({ length: 3 }).map((_, i) => ({
        id: `song${i}`,
        playerId: `player${i}`,
        songId: `s${i}`,
        songDurationSeconds: 120,
      })),
    };
    jukeboxService['clanJukeboxMap'].set(clanId, jukebox);

    await jukeboxService.startNextSong(clanId);

    const updatedJukebox = jukeboxService['clanJukeboxMap'].get(clanId);
    expect(updatedJukebox).not.toEqual(oldCurrentSong);
    expect(updatedJukebox.songQueue).toHaveLength(2);
    expect(jukeboxNotifier.songChange).toHaveBeenCalledTimes(1);
  });

  it('delete the jukebox if the queue is empty', async () => {
    const clanId = 'clan1';
    const oldCurrentSong = {
      id: 'oldId',
      playerId: 'oldP',
      songId: 'oldS',
      songDurationSeconds: 10,
      startedAt: 3,
    };

    const jukebox = {
      clanId,
      currentSong: oldCurrentSong,
      songQueue: [],
    };
    jukeboxService['clanJukeboxMap'].set(clanId, jukebox);

    await jukeboxService.startNextSong(clanId);

    const updatedJukebox = jukeboxService['clanJukeboxMap'].get(clanId);
    expect(updatedJukebox).toBeFalsy();
    expect(jukeboxNotifier.songChange).not.toHaveBeenCalled();
  });
});
