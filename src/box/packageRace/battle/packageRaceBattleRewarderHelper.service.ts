import { IServiceReturn } from '../../../common/service/basicService/IService';
import ServiceError from '../../../common/service/basicService/ServiceError';
import {
  PackageRaceBattlePlayer,
  PackageRaceBattleReward,
  PackageRaceBattleSkipReason,
  PackageRaceBattleTeamReward,
} from './packageRaceBattle.type';
import { isOnlyNotFound } from '../packageRace.utils';
import {
  BOX_SESSION_BATTLE_LOSS_POINTS,
  BOX_SESSION_BATTLE_WIN_POINTS,
} from 'src/box/consts/boxSessionConstants';
import { ActiveMatch } from '../../../matchmaking/type/activeMatch.type';
import { MatchStatus } from '../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';

type BattleTeam = PackageRaceBattlePlayer & { teamId: string };
type BattleTeams = { boxId: string; teams: [BattleTeam, BattleTeam] };

export class PackageRaceBattleRewarderHelperService {
  constructor() {}

  /**
   * Returns the two players of a finished match.
   *
   * @param match the finished match
   *
   * @returns both players of the battle or null if the match does not count.
   */
  getPackageRaceBattlePlayers(
    match: ActiveMatch,
  ): [PackageRaceBattlePlayer, PackageRaceBattlePlayer] | null {
    if (match.status !== MatchStatus.FINISHED) return null;
    if (match.matchType === MatchType.CUSTOM || match.teamSize !== 1)
      return null;

    const winningSide = match.result?.winningSide;
    if (!winningSide || !match.finishedAt) return null;

    const teams = match.teams;
    if (teams?.length !== 2) return null;

    const players: PackageRaceBattlePlayer[] = [];
    for (const team of teams) {
      if (!team.side || team.participants.length !== 1) return null;

      const participant = team.participants[0];
      if (participant.isBot === true || !participant.playerId) return null;

      players.push({
        playerId: participant.playerId,
        side: team.side,
        outcome: team.side === winningSide ? 'WIN' : 'LOSS',
      });
    }

    const [first, second] = players;
    if (first.side === second.side) return null;
    if (first.playerId === second.playerId) return null;

    return [first, second];
  }

  /**
   * A not found read means the battle is not a box session battle.
   * Other errors are returned as they are.
   *
   * @param errors array of ServiceErrors
   *
   * @returns null if only error is NOT_FOUND or ServiceErrors if other errors occurred.
   */
  notFoundAsNull(errors: ServiceError[]): IServiceReturn<BattleTeams | null> {
    if (isOnlyNotFound(errors)) return [null, null];
    return [null, errors];
  }

  /**
   * Get points for battle outcome
   *
   * @param outcome win or loss identifier
   *
   * @returns battle points based on outcome
   */
  getPointsForOutcome(outcome: 'WIN' | 'LOSS') {
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
  toTeamReward(team: BattleTeam, points: number): PackageRaceBattleTeamReward {
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
  skipReward(
    reward: PackageRaceBattleReward,
    skipReason: PackageRaceBattleSkipReason,
  ): PackageRaceBattleReward {
    return { ...reward, skipReason };
  }
}
