import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';
import { SongChangeNotificationDto } from './dto/SongChangeNotification.dto';
import { Jukebox } from './type/playlist';

/**
 * Notifier class responsible for sending jukebox-related notifications to clan members.
 * It uses the NotificationSender utility to build and dispatch notifications for events
 * such as song changes and playlist updates.
 */
export default class JukeboxNotifier {
  /**
   * The notification group destination type, which defaults to clan-level notifications.
   */
  private readonly group = NotificationGroup.CLAN;

  /**
   * The notification resource type category, which defaults to jukebox.
   */
  private readonly resource = NotificationResource.JUKEBOX;

  /**
   * Sends a notification to the clan members indicating that the current playing song has changed.
   *
   * @param newSong - The DTO containing the details of the newly playing song.
   * @param clanId - The ID of the clan whose jukebox is being updated.
   * @returns A promise that resolves when the notification is built and dispatched.
   */
  async songChange(newSong: SongChangeNotificationDto, clanId: string) {
    const topic = `/clan/${clanId}/jukebox/song/update`;
    NotificationSender.buildNotification()
      .addGroup(this.group, clanId)
      .addResource(this.resource, 'song')
      .send(NotificationStatus.UPDATE, { topic, song: newSong });
  }

  /**
   * Sends a notification to the clan members indicating that the jukebox playlist has been updated.
   *
   * @param jukebox - The jukebox state containing the updated playlist details.
   * @param clanId - The ID of the clan whose jukebox playlist is being updated.
   * @returns A promise that resolves when the notification is built and dispatched.
   */
  async playlistUpdate(jukebox: Jukebox, clanId: string) {
    const topic = `/clan/${clanId}/jukebox/playlist/update`;
    NotificationSender.buildNotification()
      .addGroup(this.group, clanId)
      .addResource(this.resource, 'playlist')
      .send(NotificationStatus.UPDATE, { topic, playlist: jukebox });
  }
}
