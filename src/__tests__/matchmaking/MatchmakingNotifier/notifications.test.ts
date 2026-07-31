import MQTTConnector from '../../../common/service/notificator/MQTTConnector';
import { MatchmakingNotifier } from '../../../matchmaking/matchmaking.notifier';
import { InviteStatus } from '../../../matchmaking/enum/inviteStatus.enum';
import { MatchStatus } from '../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';
import { MatchmakingInviteDto } from '../../../matchmaking/dto/matchmakingInvite.dto';
import { MatchmakingMatchDto } from '../../../matchmaking/dto/matchmakingMatch.dto';

jest.mock('../../../common/service/notificator/MQTTConnector', () => ({
  getInstance: jest.fn(),
}));

describe('MatchmakingNotifier notifications', () => {
  let publishMock: jest.Mock;
  let notifier: MatchmakingNotifier;

  const invite: MatchmakingInviteDto = {
    id: 'invite-1',
    matchType: MatchType.RANDOM,
    status: InviteStatus.QUEUED,
    ownerPlayerId: 'player-1',
    players: ['player-1'],
    bots: [
      {
        botId: 'invite-1:bot:1',
        displayName: 'Bot 1',
        isBot: true,
      },
    ],
    teamSize: 2,
    allowBots: true,
    createdAt: '2026-07-06T08:00:00.000Z',
    updatedAt: '2026-07-06T08:00:01.000Z',
    readyAt: '2026-07-06T08:00:01.000Z',
  };

  const match: MatchmakingMatchDto = {
    id: 'match-1',
    matchType: MatchType.RANDOM,
    status: MatchStatus.ACTIVE,
    teamSize: 2,
    teams: [
      {
        side: TeamSide.A,
        players: [{ playerId: 'player-1', isBot: false }],
        bots: [],
      },
      {
        side: TeamSide.B,
        players: [{ playerId: 'player-2', isBot: false }],
        bots: [],
      },
    ],
    startedAt: '2026-07-06T08:00:02.000Z',
  };

  beforeEach(() => {
    publishMock = jest.fn();
    (MQTTConnector.getInstance as jest.Mock).mockReturnValue({
      publish: publishMock,
    });
    notifier = new MatchmakingNotifier();
  });

  it('publishes invite updates to the player invite topic', async () => {
    await notifier.inviteUpdated('player-1', invite);

    expect(publishMock).toHaveBeenCalledWith(
      '/matchmaking/invites/player/player-1',
      JSON.stringify({ type: 'INVITE_UPDATED', payload: invite }),
    );
  });

  it('publishes match found notifications to the player match topic', async () => {
    await notifier.matchFound('player-1', match);

    expect(publishMock).toHaveBeenCalledWith(
      '/matchmaking/matches/player/player-1',
      JSON.stringify({ type: 'MATCH_FOUND', payload: match }),
    );
  });

  it('publishes match-scoped events to the match topic', async () => {
    await notifier.matchEvent('match-1', 'MATCH_STARTED', match);

    expect(publishMock).toHaveBeenCalledWith(
      '/match/match-1',
      JSON.stringify({ type: 'MATCH_STARTED', payload: match }),
    );
  });
});
