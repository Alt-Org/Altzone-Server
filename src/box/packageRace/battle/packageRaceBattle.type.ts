import { MatchType } from '../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';

/**
 * Why an eligible session battle did not change the package race battle points.
 *
 * - ALREADY_PROCESSED: the result of this match has already been counted
 * - RACE_NOT_ACTIVE: the package race has ended or a team is not in the race
 * - SAME_TEAM: both players belong to the same session team
 */
export type PackageRaceBattleSkipReason =
  | 'ALREADY_PROCESSED'
  | 'RACE_NOT_ACTIVE'
  | 'SAME_TEAM';

/**
 * Battle points change of one team caused by a session battle.
 */
export type PackageRaceBattleTeamReward = {
  teamId: string;
  playerId: string;
  side: TeamSide;
  outcome: 'WIN' | 'LOSS';
  points: number;
};

/**
 * Result of handling a finished matchmaking battle in a box testing session.
 */
export type PackageRaceBattleReward = {
  boxId: string;
  matchId: string;
  matchType: MatchType;
  awarded: boolean;
  skipReason?: PackageRaceBattleSkipReason;
  teams: [PackageRaceBattleTeamReward, PackageRaceBattleTeamReward];
};

/**
 * Player in a battle of a package race
 */
export type PackageRaceBattlePlayer = {
  playerId: string;
  side: TeamSide;
  outcome: 'WIN' | 'LOSS';
};

// Useful helper types for PackageRaceBattleRewarderService & its helper service
export type BattleTeam = PackageRaceBattlePlayer & { teamId: string };
export type BattleTeams = { boxId: string; teams: [BattleTeam, BattleTeam] };
export type BoxIdDoc = { _id: unknown; box_id?: string | null };

/**
 * Emitted after the transaction that applied package race battle points has committed.
 * Payload: PackageRaceBattleReward with awarded = true.
 */
export const PACKAGE_RACE_BATTLE_POINTS_AWARDED_EVENT =
  'packageRace.battlePointsAwarded';
