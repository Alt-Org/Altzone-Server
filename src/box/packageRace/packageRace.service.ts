import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { FilterQuery, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Box } from '../schemas/box.schema';
import { Clan } from '../../clan/clan.schema';
import { IServiceReturn } from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import BasicService from '../../common/service/basicService/BasicService';
import { BoxService } from '../box.service';
import { ClanService } from '../../clan/clan.service';
import { PackageRace, PackageRaceTeamResult } from './packageRace.schema';
import { PackageRaceStatus } from './enum/packageRaceStatus.enum';
import { PackageRaceDto } from './dto/packageRace.dto';
import { PackageRaceHelperService } from './packageRaceHelper.service';
import { BoxWithRace, isOnlyNotFound } from './packageRace.utils';
import PackageRaceNotifier from './packageRace.notifier';
import {
  SESSION_TASK_POINTS_AWARDED_EVENT,
  SessionTaskReward,
} from './sessionTask/sessionTaskReward.type';
import {
  PACKAGE_RACE_BATTLE_POINTS_AWARDED_EVENT,
  PackageRaceBattleReward,
} from './battle/packageRaceBattle.type';

@Injectable()
export class PackageRaceService {
  constructor(
    @InjectModel(Box.name) private readonly boxModel: Model<Box>,
    private readonly boxService: BoxService,
    private readonly clanService: ClanService,
    private readonly notifier: PackageRaceNotifier,
  ) {
    this.basicService = new BasicService(boxModel);
    this.helperService = new PackageRaceHelperService();
  }

  private readonly basicService: BasicService;
  private readonly helperService: PackageRaceHelperService;
  private readonly logger = new Logger(PackageRaceService.name);

  /**
   * Publishes the updated package race to both session teams after session
   * task points were awarded.
   *
   * @param reward the awarded session task reward
   */
  @OnEvent(SESSION_TASK_POINTS_AWARDED_EVENT)
  async publishSessionTaskScore(reward: SessionTaskReward): Promise<void> {
    try {
      const [race, errors] = await this.getPackageRace(reward.boxId);
      if (errors) {
        this.logger.warn(
          `Could not publish package race score of box ${reward.boxId}`,
        );
        return;
      }

      this.notifier.scoreUpdated(race, {
        type: reward.taskType,
        teamId: reward.teamId,
        completedByPlayerId: reward.completedByPlayerId,
        points: reward.points,
      });
    } catch (error) {
      this.logger.error(
        `Failed to publish package race score of box ${reward.boxId}`,
        error,
      );
    }
  }

  /**
   * Publishes the updated package race to both session teams after battle
   * points of a session battle were applied.
   *
   * @param reward the awarded battle reward
   */
  @OnEvent(PACKAGE_RACE_BATTLE_POINTS_AWARDED_EVENT)
  async publishBattleScore(reward: PackageRaceBattleReward): Promise<void> {
    try {
      const [race, errors] = await this.getPackageRace(reward.boxId);
      if (errors) {
        this.logger.warn(
          `Could not publish package race score of box ${reward.boxId}`,
        );
        return;
      }

      this.notifier.battleScoreUpdated(race, {
        matchId: reward.matchId,
        teams: reward.teams.map((team) => ({
          teamId: team.teamId,
          playerId: team.playerId,
          outcome: team.outcome,
          points: team.points,
        })),
      });
    } catch (error) {
      this.logger.error(
        `Failed to publish package race score of box ${reward.boxId}`,
        error,
      );
    }
  }

  /**
   * Reads the package race of the specified box session.
   * While the package race has status ACTIVE, the team points are read live.
   * Once it has status ENDED, the frozen results are returned.
   *
   * @param box_id _id of the box the package race belongs to.
   * @returns a promise that resolves to an object (the package race) or an array of ServiceErrors.
   */
  async getPackageRace(
    box_id: string,
  ): Promise<IServiceReturn<PackageRaceDto>> {
    const [box, boxErrors] = await this.readBoxWithRace(box_id);
    if (boxErrors) return [null, boxErrors];

    if (box.packageRace.status === PackageRaceStatus.ENDED)
      return [
        this.helperService.toPackageRaceDto(
          box_id,
          box.packageRace,
          box.packageRace.teams,
        ),
        null,
      ];

    const [teams, teamErrors] = await this.readLiveTeamResults(box);
    if (teamErrors) return [null, teamErrors];

    return [
      this.helperService.toPackageRaceDto(box_id, box.packageRace, teams),
      null,
    ];
  }

  /**
   * Ends the active package race of the specified box and freezes the current team standings.
   *
   * @param box_id _id of the box the package race belongs to.
   * @returns a promise that resolves to an object (the ended package race) or an array of ServiceErrors.
   */
  async endPackageRace(
    box_id: string,
  ): Promise<IServiceReturn<PackageRaceDto>> {
    const [box, boxErrors] = await this.readBoxWithRace(box_id);
    if (boxErrors) return [null, boxErrors];

    const alreadyEndedError = new ServiceError({
      reason: SEReason.NOT_ALLOWED,
      field: 'packageRace',
      message: 'The package race has already ended',
    });

    if (box.packageRace.status === PackageRaceStatus.ENDED)
      return [null, [alreadyEndedError]];

    const [teams, teamErrors] = await this.readLiveTeamResults(box);
    if (teamErrors) return [null, teamErrors];

    const endedRace: PackageRace = {
      status: PackageRaceStatus.ENDED,
      startedAt: box.packageRace.startedAt,
      endsAt: box.packageRace.endsAt,
      endedAt: new Date(),
      teams,
    };

    // Only an active race may be ended
    const activeRaceFilter: FilterQuery<Box> = {
      _id: box._id,
      'packageRace.status': PackageRaceStatus.ACTIVE,
    };

    const [, updateErrors] = await this.basicService.updateOne(
      { $set: { packageRace: endedRace } },
      { filter: activeRaceFilter },
    );
    if (updateErrors) {
      if (isOnlyNotFound(updateErrors)) return [null, [alreadyEndedError]];
      return [null, updateErrors];
    }

    return [
      this.helperService.toPackageRaceDto(box_id, endedRace, teams),
      null,
    ];
  }

  /**
   * Reads the box and its package race.
   *
   * @param box_id _id of the box the package race belongs to.
   * @returns a promise that resolves to an object (Box with valid package race) or an array of ServiceErrors.
   */
  private async readBoxWithRace(
    box_id: string,
  ): Promise<IServiceReturn<BoxWithRace>> {
    if (!box_id)
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.REQUIRED,
            field: 'box_id',
            value: box_id,
            message: 'box_id is required',
          }),
        ],
      ];

    const boxNotFoundError = new ServiceError({
      reason: SEReason.NOT_FOUND,
      field: 'box_id',
      value: box_id,
      message: 'Box with this _id is not found',
    });

    if (!ObjectId.isValid(box_id)) return [null, [boxNotFoundError]];

    const [boxDoc, readErrors] = await this.boxService.readOneById(box_id, {
      select: ['packageRace'],
    });
    if (readErrors) {
      if (isOnlyNotFound(readErrors)) return [null, [boxNotFoundError]];
      return [null, readErrors];
    }

    const box = boxDoc.toObject<Box>();

    if (box.packageRace) return [box as BoxWithRace, null];

    return [
      null,
      [
        new ServiceError({
          reason: SEReason.NOT_FOUND,
          field: 'packageRace',
          value: box_id,
          message:
            'The box has no package race. The package race starts when the testing session is started.',
        }),
      ],
    ];
  }

  /**
   * Reads the current standings of the package race teams of the box.
   *
   * @param box Box with valid package race.
   * @returns a Promise that resolves to an object (Package race team results) or an array of ServiceErrors.
   */
  private async readLiveTeamResults(
    box: BoxWithRace,
  ): Promise<IServiceReturn<PackageRaceTeamResult[]>> {
    const teams = box.packageRace.teams ?? [];
    if (teams.length === 0) return [[], null];

    const [clans, clanErrors] = await this.clanService.readAll({
      filter: {
        _id: { $in: teams.map((team) => team.team_id) },
        box_id: box._id.toString(),
      } as FilterQuery<Clan>,
      select: ['_id', 'name', 'points', 'battlePoints'],
    });
    if (clanErrors) {
      if (isOnlyNotFound(clanErrors)) return [[], null];
      return [null, clanErrors];
    }

    const clansById = new Map(clans.map((clan) => [clan._id.toString(), clan]));

    const results: PackageRaceTeamResult[] = [];
    for (const team of teams) {
      const clan = clansById.get(team.team_id.toString());
      if (!clan) continue;

      results.push({
        team_id: new ObjectId(team.team_id.toString()),
        name: clan.name,
        memberCount: team.memberCount,
        targetPoints: team.targetPoints,
        taskPoints: clan.points ?? 0,
        battlePoints: clan.battlePoints ?? 0,
      });
    }

    return [results, null];
  }
}
