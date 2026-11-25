import { Injectable } from '@nestjs/common';
import { NotificationGroup } from '../../common/service/notificator/enum/NotificationGroup.enum';
import { NotificationResource } from '../../common/service/notificator/enum/NotificationResource.enum';
import { NotificationStatus } from '../../common/service/notificator/enum/NotificationStatus.enum';
import { MqttNotificationType } from '../../common/service/notificator/enum/MqttNotificationType.enum';
import NotificationSender from '../../common/service/notificator/NotificationSender';
import { buildMqttNotification } from '../../common/service/notificator/type/MqttNotification.type';
import { PackageRaceDto } from './dto/packageRace.dto';

/**
 * The session task that changed the package race score.
 */
export type ScoredSessionTask = {
  type: string;
  teamId: string;
  completedByPlayerId: string;
  points: number;
};

export type PackageRaceScoreUpdatedPayload = {
  sessionTask: ScoredSessionTask;
  packageRace: PackageRaceDto;
};

@Injectable()
export default class PackageRaceNotifier {
  private readonly group = NotificationGroup.CLAN;
  private readonly resource = NotificationResource.PACKAGE_RACE;

  /**
   * The package race score has changed. Both session teams are notified
   * so both of them see the current standings.
   *
   * Topic: /clan/{teamId}/package_race/{boxId}/update
   *
   * @param packageRace the updated package race (same as the GET /box/package-race response)
   * @param sessionTask the session task that changed the score
   */
  scoreUpdated(packageRace: PackageRaceDto, sessionTask: ScoredSessionTask) {
    const notification = buildMqttNotification<PackageRaceScoreUpdatedPayload>(
      'package_race',
      MqttNotificationType.PACKAGE_RACE_SCORE_UPDATED,
      { sessionTask, packageRace },
    );

    for (const team of packageRace.teams) {
      NotificationSender.buildNotification()
        .addGroup(this.group, team.teamId)
        .addResource(this.resource, packageRace.boxId)
        .send(NotificationStatus.UPDATE, notification);
    }
  }
}
