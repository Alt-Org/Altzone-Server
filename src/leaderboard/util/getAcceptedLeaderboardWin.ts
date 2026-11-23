import { envVars } from '../../common/service/envHandler/envVars';
import { Environment } from '../../common/service/envHandler/enum/environment.enum';
import { MatchStatus } from '../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../matchmaking/enum/matchType.enum';
import { ActiveMatch } from '../../matchmaking/type/activeMatch.type';

export type AcceptedLeaderboardWin = {
  winnerPlayerId: string;
  scoreReachedAt: Date;
};

export type MatchRewardEligibility =
  | {
      eligible: false;
      humanParticipantIds: [];
      winnerPlayerId: null;
      scoreReachedAt: null;
    }
  | {
      eligible: true;
      humanParticipantIds: string[];
      winnerPlayerId: string | null;
      scoreReachedAt: Date;
    };

const INELIGIBLE_MATCH: MatchRewardEligibility = {
  eligible: false,
  humanParticipantIds: [],
  winnerPlayerId: null,
  scoreReachedAt: null,
};

/**
 * Resolves the shared production eligibility and human participants for all
 * leaderboard, statistics, daily-task, and reward updates caused by a
 * finished matchmaking match.
 *
 * Bot participation does not change a match's eligibility. Bots are excluded
 * from the returned participant IDs and can never be returned as the winner.
 */
export const getMatchRewardEligibility = (
  match: ActiveMatch,
): MatchRewardEligibility => {
  if (envVars.ENVIRONMENT === Environment.TESTING_SESSION) {
    return INELIGIBLE_MATCH;
  }
  if (match.status !== MatchStatus.FINISHED) return INELIGIBLE_MATCH;
  if (match.matchType === MatchType.CUSTOM || match.teamSize !== 1) {
    return INELIGIBLE_MATCH;
  }
  if (!match.result?.winningSide || !match.finishedAt) {
    return INELIGIBLE_MATCH;
  }

  const teams = match.teams;
  if (
    teams.length !== 2 ||
    teams.some((team) => team.participants.length !== 1)
  ) {
    return INELIGIBLE_MATCH;
  }

  const humanParticipantIds = teams.flatMap((team) => {
    const participant = team.participants[0];
    if (participant.isBot === true) return [];
    return [participant.playerId];
  });
  if (humanParticipantIds.length === 0) return INELIGIBLE_MATCH;

  const winningTeam = teams.find(
    (team) => team.side === match.result?.winningSide,
  );
  if (!winningTeam) return INELIGIBLE_MATCH;

  const scoreReachedAt = new Date(match.finishedAt);
  if (Number.isNaN(scoreReachedAt.getTime())) return INELIGIBLE_MATCH;

  const winner = winningTeam.participants[0];
  return {
    eligible: true,
    humanParticipantIds,
    winnerPlayerId: winner.isBot === true ? null : winner.playerId,
    scoreReachedAt,
  };
};

/**
 * Returns the accepted winner of a production leaderboard battle.
 * Player and clan win recorders share this function so their eligibility
 * rules cannot drift apart.
 */
export const getAcceptedLeaderboardWin = (
  match: ActiveMatch,
): AcceptedLeaderboardWin | null => {
  const eligibility = getMatchRewardEligibility(match);
  if (!eligibility.eligible || !eligibility.winnerPlayerId) return null;

  return {
    winnerPlayerId: eligibility.winnerPlayerId,
    scoreReachedAt: eligibility.scoreReachedAt,
  };
};
