import MQTTConnector from '../../../common/service/notificator/MQTTConnector';
import { MqttNotificationType } from '../../../common/service/notificator/enum/MqttNotificationType.enum';
import { MatchmakingNotifier } from '../../../matchmaking/matchmaking.notifier';
import { InviteStatus } from '../../../matchmaking/enum/inviteStatus.enum';
import { MatchStatus } from '../../../matchmaking/enum/matchStatus.enum';
import { MatchType } from '../../../matchmaking/enum/matchType.enum';
import { TeamSide } from '../../../matchmaking/enum/teamSide.enum';
import { MatchmakingMqttMatchDto } from '../../../matchmaking/dto/matchmakingMqttMatch.dto';
import { MatchmakingRoomDto } from '../../../matchmaking/dto/matchmakingRoom.dto';
import { MatchmakingRoomInviteDto } from '../../../matchmaking/dto/matchmakingRoomInvite.dto';

jest.mock('../../../common/service/notificator/MQTTConnector', () => ({
  getInstance: jest.fn(),
}));

describe('MatchmakingNotifier notifications', () => {
  let publishMock: jest.Mock;
  let notifier: MatchmakingNotifier;

  const room: MatchmakingRoomDto = {
    id: 'invite-1',
    matchType: MatchType.RANDOM,
    status: InviteStatus.QUEUED,
    ownerPlayerId: 'player-1',
    players: [{ playerId: 'player-1', name: 'Player 1', avatar: null }],
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

  const match: MatchmakingMqttMatchDto = {
    id: 'match-1',
    matchType: MatchType.RANDOM,
    status: MatchStatus.ACTIVE,
    teamSize: 2,
    teams: [
      {
        side: TeamSide.A,
        players: [{ playerId: 'player-1', name: 'Player 1', avatar: null }],
        bots: [],
      },
      {
        side: TeamSide.B,
        players: [{ playerId: 'player-2', name: 'Player 2', avatar: null }],
        bots: [],
      },
    ],
    startedAt: '2026-07-06T08:00:02.000Z',
  };

  const roomInvite: MatchmakingRoomInviteDto = {
    id: 'invite-1',
    matchType: MatchType.RANDOM,
    status: InviteStatus.OPEN,
    ownerPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
    senderPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
    teamSize: 2,
    allowBots: true,
    sentAt: '2026-07-06T08:00:03.000Z',
  };

  beforeEach(() => {
    publishMock = jest.fn();
    (MQTTConnector.getInstance as jest.Mock).mockReturnValue({
      publish: publishMock,
    });
    notifier = new MatchmakingNotifier();
  });

  it('publishes room updates to the player room topic', async () => {
    await notifier.inviteUpdated('player-1', room);

    expect(publishMock).toHaveBeenCalledWith(
      '/matchmaking/rooms/player/player-1',
      JSON.stringify({
        topic: 'matchmaking',
        type: MqttNotificationType.ROOM_UPDATED,
        payload: room,
      }),
    );
  });

  it('publishes player invite notifications to the player invite topic', async () => {
    await notifier.inviteReceived(
      'player-2',
      MqttNotificationType.INVITE_RECEIVED,
      roomInvite,
    );

    expect(publishMock).toHaveBeenCalledWith(
      '/matchmaking/invites/player/player-2',
      JSON.stringify({
        topic: 'matchmaking',
        type: MqttNotificationType.INVITE_RECEIVED,
        payload: roomInvite,
      }),
    );
  });

  it('publishes clan invite notifications to the player invite topic', async () => {
    await notifier.inviteReceived(
      'player-2',
      MqttNotificationType.CLAN_INVITE_RECEIVED,
      roomInvite,
    );

    expect(publishMock).toHaveBeenCalledWith(
      '/matchmaking/invites/player/player-2',
      JSON.stringify({
        topic: 'matchmaking',
        type: MqttNotificationType.CLAN_INVITE_RECEIVED,
        payload: roomInvite,
      }),
    );
  });

  it('publishes match found notifications to the player match topic', async () => {
    await notifier.matchFound('player-1', match);

    expect(publishMock).toHaveBeenCalledWith(
      '/matchmaking/matches/player/player-1',
      JSON.stringify({
        topic: 'matchmaking',
        type: MqttNotificationType.MATCH_FOUND,
        payload: match,
      }),
    );
  });

  it('publishes match-scoped events to the match topic', async () => {
    await notifier.matchEvent('match-1', 'MATCH_STARTED', match);

    expect(publishMock).toHaveBeenCalledWith(
      '/match/match-1',
      JSON.stringify({
        topic: 'matchmaking',
        type: 'MATCH_STARTED',
        payload: match,
      }),
    );
  });
});
