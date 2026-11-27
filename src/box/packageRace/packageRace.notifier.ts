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

/**
 * The battle points change of one team caused by a session battle.
 */
export type ScoredBattleTeam = {
  teamId: string;
  playerId: string;
  outcome: 'WIN' | 'LOSS';
  points: number;
};

/**
 * The session battle that changed the package race score.
 */
export type ScoredBattle = {
  matchId: string;
  teams: ScoredBattleTeam[];
};

export type PackageRaceBattleScoreUpdatedPayload = {
  battle: ScoredBattle;
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

    this.sendToTeams(packageRace, notification);
  }

  /**
   * The package race battle points have changed after a session battle.
   * Both session teams are notified so both of them see the current standings.
   *
   * Topic: /clan/{teamId}/package_race/{boxId}/update
   *
   * @param packageRace the updated package race (same as the GET /box/package-race response)
   * @param battle the session battle that changed the score
   */
  battleScoreUpdated(packageRace: PackageRaceDto, battle: ScoredBattle) {
    const notification =
      buildMqttNotification<PackageRaceBattleScoreUpdatedPayload>(
        'package_race',
        MqttNotificationType.PACKAGE_RACE_SCORE_UPDATED,
        { battle, packageRace },
      );

    this.sendToTeams(packageRace, notification);
  }

  /**
   * Send notification resouce to the package race teams in a Box session.
   *
   * @param packageRace - valid PackageRaceDto object that contains _id of specified box (boxId)
   * @param notification - the notification object
   */
  private sendToTeams(packageRace: PackageRaceDto, notification: object) {
    for (const team of packageRace.teams) {
      NotificationSender.buildNotification()
        .addGroup(this.group, team.teamId)
        .addResource(this.resource, packageRace.boxId)
        .send(NotificationStatus.UPDATE, notification);
    }
  }
}
