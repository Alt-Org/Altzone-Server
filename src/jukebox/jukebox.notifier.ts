import { NotificationGroup } from '../common/service/notificator/enum/NotificationGroup.enum';
import { NotificationResource } from '../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../common/service/notificator/enum/NotificationStatus.enum';
import NotificationSender from '../common/service/notificator/NotificationSender';
import { SongChangeNotificationDto } from './dto/SongChangeNotification.dto';
import { Jukebox } from './type/playlist';

export default class JukeboxNotifier {
  private readonly group = NotificationGroup.CLAN;
  private readonly resource = NotificationResource.JUKEBOX;

  async songChange(newSong: SongChangeNotificationDto, clanId: string) {
    const topic = `/clan/${clanId}/jukebox/song/update`;
    NotificationSender.buildNotification()
      .addGroup(this.group, clanId)
      .addResource(this.resource, 'song')
      .send(NotificationStatus.UPDATE, { topic, song: newSong });
  }

  async playlistUpdate(jukebox: Jukebox, clanId: string) {
    const topic = `/clan/${clanId}/jukebox/playlist/update`;
    NotificationSender.buildNotification()
      .addGroup(this.group, clanId)
      .addResource(this.resource, 'playlist')
      .send(NotificationStatus.UPDATE, { topic, playlist: jukebox });
  }
}
