import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';
import { SongChangeNotificationDto } from './dto/SongChangeNotification.dto';

export default class JukeboxNotifier {
  private readonly group = NotificationGroup.CLAN;
  private readonly resource = NotificationResource.JUKEBOX;

  /**
   * Sends a notification about song change
   * @param newSong - The current song payload to send
   * @param clanId - Id of the clan to receive the notification
   */
  async songChange(newSong: SongChangeNotificationDto, clanId: string) {
    const topic = `/clan/${clanId}/jukebox/song/update`;
    NotificationSender.buildNotification()
      .addGroup(this.group, clanId)
      .addResource(this.resource, 'song')
      .send(NotificationStatus.UPDATE, { topic, song: newSong });
  }
}
