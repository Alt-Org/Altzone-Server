import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ClanService } from '../../../clan/clan.service';
import { PlayerService } from '../../../player/player.service';
import { BoxService } from '../../box.service';
import { IServiceReturn } from '../../../common/service/basicService/IService';
import BasicService, {
  convertMongooseToServiceErrors,
} from '../../../common/service/basicService/BasicService';
import ServiceError from '../../../common/service/basicService/ServiceError';
import { SEReason } from '../../../common/service/basicService/SEReason';
import { ActiveMatch } from '../../../matchmaking/type/activeMatch.type';
import isTestingSession from '../../util/isTestingSession';
import {
  BOX_SESSION_BATTLE_LOSS_POINTS,
  BOX_SESSION_BATTLE_WIN_POINTS,
} from '../../consts/boxSessionConstants';
import { PackageRaceStatus } from '../enum/packageRaceStatus.enum';
import { isOnlyNotFound } from '../packageRace.utils';
import {
  PackageRaceBattleResult,
  PackageRaceBattleTeamChange,
} from './packageRaceBattleResult.schema';
import {
  PackageRaceBattleReward,
  PackageRaceBattleSkipReason,
  PackageRaceBattleTeamReward,
} from './packageRaceBattleReward.type';
import {
  getPackageRaceBattlePlayers,
  PackageRaceBattlePlayer,
} from './getPackageRaceBattlePlayers';

type BattleTeam = PackageRaceBattlePlayer & { teamId: string };
type BattleTeams = { boxId: string; teams: [BattleTeam, BattleTeam] };
type BoxIdDoc = { _id: unknown; box_id?: string | null };

@Injectable()
export class PackageRaceBattleRewarder {
  constructor(
    private readonly playerService: PlayerService,
    private readonly clanService: ClanService,
    private readonly boxService: BoxService,
    @InjectModel(PackageRaceBattleResult.name)
    private readonly resultModel: Model<PackageRaceBattleResult>,
  ) {
    this.resultBasicService = new BasicService(resultModel);
  }

  private readonly resultBasicService: BasicService;

  /**
   * Applies the package race battle points of a finished session battle to both teams.
   *
   * @param match the finished match
   * @param session the transaction session of the match finish
   *
   * @returns
   * - null if the match is not a package race battle (the API is not in
   *   TESTING_SESSION, the match is CUSTOM, has bots, is not 1v1, or its players
   *   do not belong to teams of the same box).
   * - PackageRaceBattleReward when the match is a package race battle.
   * - ServiceErrors if any occurred.
   */
  async rewardTeams(
    match: ActiveMatch,
    session: ClientSession,
  ): Promise<IServiceReturn<PackageRaceBattleReward | null>> {
    if (!isTestingSession()) return [null, null];

    const players = getPackageRaceBattlePlayers(match);
    if (!players) return [null, null];

    const [battle, battleErrors] = await this.readBattleTeams(players, session);
    if (battleErrors) return [null, battleErrors];
    if (!battle) return [null, null];

    const reward: PackageRaceBattleReward = {
      boxId: battle.boxId,
      matchId: match.id,
      matchType: match.matchType,
      awarded: false,
      teams: battle.teams.map((team) => this.toTeamReward(team, 0)) as [
        PackageRaceBattleTeamReward,
        PackageRaceBattleTeamReward,
      ],
    };

    const [first, second] = battle.teams;
    if (first.teamId === second.teamId)
      return [this.skipReward(reward, 'SAME_TEAM'), null];

    const [isRaceActive, raceErrors] = await this.areTeamsInActiveRace(
      battle.boxId,
      [first.teamId, second.teamId],
      session,
    );
    if (raceErrors) return [null, raceErrors];
    if (!isRaceActive)
      return [this.skipReward(reward, 'RACE_NOT_ACTIVE'), null];

    const [isFirstResult, recordErrors] = await this.recordResult(
      match,
      battle,
      session,
    );
    if (recordErrors) return [null, recordErrors];
    if (!isFirstResult)
      return [this.skipReward(reward, 'ALREADY_PROCESSED'), null];

    const changes: PackageRaceBattleTeamChange[] = [];
    for (const team of battle.teams) {
      const [change, changeErrors] = await this.applyBattlePoints(
        battle.boxId,
        team,
        session,
      );
      if (changeErrors) return [null, changeErrors];
      changes.push(change);
    }

    const [, resultErrors] = await this.resultBasicService.updateOne(
      { $set: { teams: changes } },
      { filter: { matchId: match.id }, session },
    );
    if (resultErrors) return [null, resultErrors];

    reward.awarded = true;
    reward.teams = battle.teams.map((team, i) =>
      this.toTeamReward(team, changes[i].appliedPoints),
    ) as [PackageRaceBattleTeamReward, PackageRaceBattleTeamReward];

    return [reward, null];
  }

  /**
   * Reads the session teams of both players.
   * Both players and their teams have to belong to the same box.
   *
   * @param players both players of the battle
   * @param session the transaction session of the match finish
   *
   * @returns
   * - _id of the box and the battle teams.
   * - null if the battle is not a battle of one box session.
   * - ServiceErrors if any occurred.
   */
  private async readBattleTeams(
    players: [PackageRaceBattlePlayer, PackageRaceBattlePlayer],
    session: ClientSession,
  ): Promise<IServiceReturn<BattleTeams | null>> {
    if (players.some((player) => !ObjectId.isValid(player.playerId)))
      return [null, null];

    const [playerDocs, playerErrors] =
      await this.playerService.basicService.readMany<
        BoxIdDoc & { clan_id?: unknown }
      >({
        filter: { _id: { $in: players.map((player) => player.playerId) } },
        select: ['_id', 'clan_id', 'box_id'],
        session,
      });
    if (playerErrors) return this.notFoundAsNull(playerErrors);

    const playersById = new Map(
      playerDocs.map((player) => [player._id.toString(), player]),
    );

    const teams: BattleTeam[] = [];
    let boxId: string | null = null;
    for (const player of players) {
      const playerDoc = playersById.get(player.playerId);
      const playerBoxId = playerDoc?.box_id?.toString();
      const teamId = playerDoc?.clan_id?.toString();
      if (!playerBoxId || !teamId || !ObjectId.isValid(teamId))
        return [null, null];
      if (boxId && boxId !== playerBoxId) return [null, null];

      boxId = playerBoxId;
      teams.push({ ...player, teamId });
    }

    const [clanDocs, clanErrors] =
      await this.clanService.basicService.readMany<BoxIdDoc>({
        filter: { _id: { $in: teams.map((team) => team.teamId) } },
        select: ['_id', 'box_id'],
        session,
      });
    if (clanErrors) return this.notFoundAsNull(clanErrors);

    const clanBoxIds = new Map(
      clanDocs.map((clan) => [clan._id.toString(), clan.box_id?.toString()]),
    );
    if (teams.some((team) => clanBoxIds.get(team.teamId) !== boxId))
      return [null, null];

    return [{ boxId, teams: teams as [BattleTeam, BattleTeam] }, null];
  }

  /**
   * Checks that the box has an ACTIVE package race and both teams take part in it.
   *
   * @param boxId _id of the specified Box
   * @param teamIds _ids of the battle teams
   * @param session the transaction session of the match finish
   *
   * @returns true if the box has an active package race and both teams take part in it, or ServiceErrors if any occurred.
   */
  private async areTeamsInActiveRace(
    boxId: string,
    teamIds: string[],
    session: ClientSession,
  ): Promise<IServiceReturn<boolean>> {
    if (!ObjectId.isValid(boxId)) return [false, null];

    const [box, boxErrors] = await this.boxService.readOneById(boxId, {
      select: ['packageRace'],
      session,
    });
    if (boxErrors) {
      if (isOnlyNotFound(boxErrors)) return [false, null];
      return [null, boxErrors];
    }

    const race = box.packageRace;
    if (!race || race.status !== PackageRaceStatus.ACTIVE) return [false, null];

    const raceTeamIds = new Set(
      (race.teams ?? []).map((team) => team.team_id.toString()),
    );
    return [teamIds.every((teamId) => raceTeamIds.has(teamId)), null];
  }

  /**
   * Records the battle result. The unique matchId makes the record the claim
   * which guarantees that the result of a match is counted only once.
   *
   * @param match the finished match
   * @param battle _id of the box session and both battle teams
   * @param session the transaction session of the match finish
   *
   * @returns true if this is the first time the result of the match is recorded, or ServiceErrors if any occurred.
   */
  private async recordResult(
    match: ActiveMatch,
    battle: BattleTeams,
    session: ClientSession,
  ): Promise<IServiceReturn<boolean>> {
    try {
      const result = await this.resultModel.updateOne(
        { matchId: match.id },
        {
          $setOnInsert: {
            box_id: battle.boxId,
            matchId: match.id,
            matchType: match.matchType,
            winningSide: match.result.winningSide,
            finishedAt: new Date(match.finishedAt),
            teams: battle.teams.map((team) => ({
              team_id: new ObjectId(team.teamId),
              player_id: new ObjectId(team.playerId),
              side: team.side,
              outcome: team.outcome,
              points: this.getPointsForOutcome(team.outcome),
              appliedPoints: null,
              battlePointsAfter: null,
            })),
          },
        },
        { upsert: true, session },
      );

      return [result.upsertedCount === 1, null];
    } catch (error) {
      return [null, convertMongooseToServiceErrors(error)];
    }
  }

  /**
   * Adds the battle points of the outcome to the team.
   *
   * @param boxId _id of the box session
   * @param team the battle team
   * @param session the transaction session of the match finish
   *
   * @returns the change applied to the team, or ServiceErrors if any occurred (also if the team is not found)
   */
  private async applyBattlePoints(
    boxId: string,
    team: BattleTeam,
    session: ClientSession,
  ): Promise<IServiceReturn<PackageRaceBattleTeamChange>> {
    const points = this.getPointsForOutcome(team.outcome);

    const [clan, readErrors] = await this.clanService.basicService.readOneById<
      BoxIdDoc & { battlePoints?: number }
    >(team.teamId, { select: ['_id', 'battlePoints', 'box_id'], session });
    if (readErrors) return [null, readErrors];
    if (clan.box_id?.toString() !== boxId)
      return [null, [this.teamNotInBoxError(team.teamId, boxId)]];

    const [, updateErrors] = await this.clanService.basicService.updateOneById(
      team.teamId,
      [
        {
          $set: {
            battlePoints: {
              $max: [0, { $add: [{ $ifNull: ['$battlePoints', 0] }, points] }],
            },
          },
        },
      ],
      { session },
    );
    if (updateErrors) return [null, updateErrors];

    const battlePointsBefore = clan.battlePoints ?? 0;
    const battlePointsAfter = Math.max(0, battlePointsBefore + points);

    return [
      {
        team_id: new ObjectId(team.teamId),
        player_id: new ObjectId(team.playerId),
        side: team.side,
        outcome: team.outcome,
        points,
        appliedPoints: battlePointsAfter - battlePointsBefore,
        battlePointsAfter,
      },
      null,
    ];
  }

  /**
   * A not found read means the battle is not a box session battle.
   * Other errors are returned as they are.
   *
   * @param errors array of ServiceErrors
   *
   * @returns null if only error is NOT_FOUND or ServiceErrors if other errors occurred.
   */
  private notFoundAsNull(
    errors: ServiceError[],
  ): IServiceReturn<BattleTeams | null> {
    if (isOnlyNotFound(errors)) return [null, null];
    return [null, errors];
  }

  private teamNotInBoxError(teamId: string, boxId: string) {
    return new ServiceError({
      reason: SEReason.NOT_FOUND,
      field: 'team_id',
      value: teamId,
      message: `Package race team is not found in box ${boxId}`,
    });
  }

  /**
   * Get points for battle outcome
   *
   * @param outcome win or loss identifier
   *
   * @returns battle points based on outcome
   */
  private getPointsForOutcome(outcome: 'WIN' | 'LOSS') {
    return outcome === 'WIN'
      ? BOX_SESSION_BATTLE_WIN_POINTS
      : BOX_SESSION_BATTLE_LOSS_POINTS;
  }

  /**
   * Transforms data into a valid PackageRaceBattleTeamReward object
   *
   * @param team team taking part in a battle
   * @param points battle points
   *
   * @returns PackageRaceBattleTeamReward object
   */
  private toTeamReward(
    team: BattleTeam,
    points: number,
  ): PackageRaceBattleTeamReward {
    return {
      teamId: team.teamId,
      playerId: team.playerId,
      side: team.side,
      outcome: team.outcome,
      points,
    };
  }

  /**
   * Skips the battle reward (don't change battle points)
   *
   * @param reward battle reward data
   * @param skipReason reason why the battle is not counted
   *
   * @returns PackageRaceBattleReward data and reason why the battle was not counted
   */
  private skipReward(
    reward: PackageRaceBattleReward,
    skipReason: PackageRaceBattleSkipReason,
  ): PackageRaceBattleReward {
    return { ...reward, skipReason };
  }
}
