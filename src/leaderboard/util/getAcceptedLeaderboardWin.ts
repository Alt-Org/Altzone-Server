import { envVars } from '../../common/service/envHandler/envVars';
import { Environment } from '../../common/service/envHandler/enum/environment.enum';
import { MatchStatus } from '../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../matchmaking/enum/matchType.enum';
import { ActiveMatch } from '../../matchmaking/type/activeMatch.type';

export type AcceptedLeaderboardWin = {
  winnerPlayerId: string;
  scoreReachedAt: Date;
};

/**
 * Returns the accepted winner of a production leaderboard battle.
 * Player and clan win recorders share this function so their eligibility
 * rules cannot drift apart.
 */
export const getAcceptedLeaderboardWin = (
  match: ActiveMatch,
): AcceptedLeaderboardWin | null => {
  if (envVars.ENVIRONMENT === Environment.TESTING_SESSION) return null;
  if (match.status !== MatchStatus.FINISHED) return null;
  if (match.matchType === MatchType.CUSTOM || match.teamSize !== 1) return null;
  if (!match.result?.winningSide || !match.finishedAt) return null;

  const teams = match.teams;
  if (
    teams.length !== 2 ||
    teams.some(
      (team) => team.participants.length !== 1 || team.participants[0].isBot,
    )
  ) {
    return null;
  }

  const winningTeam = teams.find(
    (team) => team.side === match.result?.winningSide,
  );
  const winner = winningTeam?.participants[0];
  if (!winner || winner.isBot !== false) return null;

  const scoreReachedAt = new Date(match.finishedAt);
  if (Number.isNaN(scoreReachedAt.getTime())) return null;

  return { winnerPlayerId: winner.playerId, scoreReachedAt };
};
