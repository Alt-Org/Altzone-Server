import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Box } from '../schemas/box.schema';
import { Clan } from '../../clan/clan.schema';
import { Player } from '../../player/schemas/player.schema';
import { IServiceReturn } from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import { SEReason } from '../../common/service/basicService/SEReason';
import BasicService from '../../common/service/basicService/BasicService';
import { SessionStage } from '../enum/SessionStage.enum';
import { BOX_SESSION_DURATION_MS } from '../consts/boxSessionConstants';
import { BoxService } from '../box.service';
import { ClanService } from '../../clan/clan.service';
import { PlayerService } from '../../player/player.service';
import { PackageRace, PackageRaceTeamResult } from './packageRace.schema';
import { PackageRaceStatus } from './enum/packageRaceStatus.enum';
import { PackageRaceDto } from './dto/packageRace.dto';
import { PackageRaceHelperService } from './packageRaceHelper.service';

type BoxWithRace = Pick<
  Box,
  '_id' | 'sessionStage' | 'sessionResetTime' | 'createdClan_ids'
> & { packageRace: PackageRace };

const isOnlyNotFound = (errors: ServiceError[]) =>
  errors.every((e) => e.reason === SEReason.NOT_FOUND);

@Injectable()
export class PackageRaceService {
  constructor(
    @InjectModel(Box.name) private readonly boxModel: Model<Box>,
    private readonly boxService: BoxService,
    private readonly clanService: ClanService,
    private readonly playerService: PlayerService,
  ) {
    this.basicService = new BasicService(boxModel);
  }

  private readonly basicService: BasicService;
  private readonly helperService = new PackageRaceHelperService();

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
      $or: [
        { 'packageRace.status': PackageRaceStatus.ACTIVE },
        { packageRace: null, sessionStage: SessionStage.TESTING },
      ],
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
      select: [
        'sessionStage',
        'sessionResetTime',
        'createdClan_ids',
        'packageRace',
      ],
    });
    if (readErrors) {
      if (isOnlyNotFound(readErrors)) return [null, [boxNotFoundError]];
      return [null, readErrors];
    }

    const box = boxDoc.toObject<Box>();

    if (box.packageRace) return [box as BoxWithRace, null];

    if (box.sessionStage === SessionStage.TESTING)
      return [
        {
          ...box,
          packageRace: {
            status: PackageRaceStatus.ACTIVE,
            startedAt: new Date(box.sessionResetTime - BOX_SESSION_DURATION_MS),
            endsAt: new Date(box.sessionResetTime),
            endedAt: null,
            teams: [],
          },
        },
        null,
      ];

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
   * Reads the current standings of the session teams of the box.
   *
   * @param box Box with valid package race.
   * @returns a Promise that resolves to an object (Package race team results) or an array of ServiceErrors.
   */
  private async readLiveTeamResults(
    box: BoxWithRace,
  ): Promise<IServiceReturn<PackageRaceTeamResult[]>> {
    const box_id = box._id.toString();
    const team_ids = box.createdClan_ids ?? [];
    if (team_ids.length === 0) return [[], null];

    const [clans, clanErrors] = await this.clanService.readAll({
      filter: { _id: { $in: team_ids }, box_id } as FilterQuery<Clan>,
      select: ['_id', 'name', 'targetPoints', 'points', 'battlePoints'],
    });
    if (clanErrors) {
      if (isOnlyNotFound(clanErrors)) return [[], null];
      return [null, clanErrors];
    }

    // Read the members of all teams at once and count them per team
    const [players, playerErrors] =
      await this.playerService.basicService.readMany<Player>({
        filter: {
          clan_id: { $in: clans.map((clan) => clan._id) },
          box_id,
        } as FilterQuery<Player>,
        select: ['clan_id'],
      });
    if (playerErrors && !isOnlyNotFound(playerErrors))
      return [null, playerErrors];

    const memberCounts = new Map<string, number>();
    for (const player of players ?? []) {
      const clan_id = player.clan_id?.toString();
      memberCounts.set(clan_id, (memberCounts.get(clan_id) ?? 0) + 1);
    }

    const results = clans.map((clan) => ({
      team_id: new ObjectId(clan._id.toString()),
      name: clan.name,
      memberCount: memberCounts.get(clan._id.toString()) ?? 0,
      targetPoints: clan.targetPoints ?? 0,
      taskPoints: clan.points ?? 0,
      battlePoints: clan.battlePoints ?? 0,
    }));

    const order = team_ids.map((id) => id.toString());
    results.sort(
      (a, b) =>
        order.indexOf(a.team_id.toString()) -
        order.indexOf(b.team_id.toString()),
    );

    return [results, null];
  }
}
