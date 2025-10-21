import { Injectable } from '@nestjs/common';
import { JukeboxQueue } from './jukebox.queue';
import { ObjectId } from 'mongodb';
import JukeboxNotifier from './jukebox.notifier';
import { AddSongDto } from './dto/AddSong.dto';
import { ClanId, Jukebox, Song } from './type/playlist';
import ServiceError from '../common/service/basicService/ServiceError';
import { SEReason } from '../common/service/basicService/SEReason';
import { ClanService } from '../clan/clan.service';

@Injectable()
export class JukeboxService {
  constructor(
    private readonly scheduler: JukeboxQueue,
    private readonly notifier: JukeboxNotifier,
    private readonly clanService: ClanService,
  ) {}

  private clanJukeboxMap = new Map<ClanId, Jukebox>();

  /**
   * Returns the jukebox based on clanId
   *
   * @param - Id of the clan whose jukebox to get.
   */
  getClanSongQueue(clanId: string) {
    return (
      this.clanJukeboxMap.get(clanId) ?? { songQueue: [], currentCong: null }
    );
  }

  /**
   * Count the amount of songs added by specified player
   *
   * @param - jukebox to count the songs from
   * @param - Id of the player whose entries to count
   */
  private countPlayerAddedSongs(jukebox: Jukebox, playerId: string): number {
    let n = jukebox.songQueue.filter(
      (song) => song.playerId === playerId,
    ).length;
    if (jukebox.currentSong?.playerId === playerId) n++;
    return n;
  }

  /**
   * Add song to the clan jukebox.
   * If there is no current song the added song starts playing immediatly
   * else it's added at the end of the song queue
   *
   * @param - Id of the clan
   * @param - Id of the player adding the song
   * @param - Song data to be added
   * @throws MORE_THAN_MAX error if player has reached the max limit of songs
   */
  async addSongToClanJukebox(
    clanId: string,
    playerId: string,
    song: AddSongDto,
  ) {
    const jukebox: Jukebox = this.clanJukeboxMap.get(clanId) ?? {
      clanId,
      songQueue: [],
      currentSong: null,
    };
    const playerAddedSongsCount = this.countPlayerAddedSongs(jukebox, playerId);
    const maxSongAmount = await this.getMaxSongAmount(clanId);
    if (playerAddedSongsCount >= maxSongAmount)
      throw new ServiceError({
        reason: SEReason.MORE_THAN_MAX,
        message: 'Players can have only 5 songs in the queue at time.',
      });

    const newSong: Song = {
      playerId,
      songId: song.songId,
      songDurationSeconds: song.songDurationSeconds,
      id: new ObjectId().toString(),
    };

    if (!jukebox.currentSong) {
      jukebox.currentSong = { ...newSong, startedAt: Date.now() };
      await this.notifier.songChange(
        { songId: newSong.songId, startedAt: jukebox.currentSong.startedAt },
        clanId,
      );
      await this.scheduler.scheduleNextSong(
        clanId,
        newSong.songDurationSeconds,
      );
    } else {
      jukebox.songQueue.push(newSong);
    }
    this.clanJukeboxMap.set(clanId, jukebox);
  }

  /**
   * Handles the song change event.
   * If there is no next song the jukebox gets removed from the map.
   * Removes the first song from the songQueue and sets it as the current song
   * and sends a notification about song change and schedules the next song change
   * based on the song duration.
   *
   * @param - Id of the clan whose jukebox to update.
   */
  async startNextSong(clanId: string) {
    const jukebox = this.clanJukeboxMap.get(clanId);
    if (!jukebox) return;

    const nextSong = jukebox.songQueue.shift();

    if (!nextSong) {
      this.clanJukeboxMap.delete(clanId);
      return;
    }

    jukebox.currentSong = { ...nextSong, startedAt: Date.now() };
    await this.notifier.songChange(
      { songId: nextSong.songId, startedAt: jukebox.currentSong.startedAt },
      clanId,
    );

    await this.scheduler.scheduleNextSong(clanId, nextSong.songDurationSeconds);
  }

  /**
   * Remove a song owned by a specified player from the clan's queue
   *
   * @param - Id of the clan whose jukebox to update
   * @param - Id of the player attempting to remove the song
   * @param - Id of the song to be removed
   * @throws Throws NOT_FOUND error if the song is not found or owned by the player
   */
  removeSongFromQueue(clanId: string, playerId: string, songId: string) {
    const jukebox = this.clanJukeboxMap.get(clanId);
    const songToRemove = jukebox.songQueue.find(
      (song) => song.id === songId && song.playerId === playerId,
    );
    if (!songToRemove) throw new ServiceError({ reason: SEReason.NOT_FOUND });

    jukebox.songQueue = jukebox.songQueue.filter((song) => song.id !== songId);
    this.clanJukeboxMap.set(clanId, jukebox);
  }

  /**
   * Get the max amount of songs a player can have in the queue.
   *
   * @param - Id of the clan
   * @returns the max number of songs allowed per player
   */
  private async getMaxSongAmount(clanId: string): Promise<number> {
    let maxSongAmount = 5;
    const [clan] = await this.clanService.readOneById(clanId);

    if (clan?.playerCount < 10) maxSongAmount = 10;

    return maxSongAmount;
  }
}
