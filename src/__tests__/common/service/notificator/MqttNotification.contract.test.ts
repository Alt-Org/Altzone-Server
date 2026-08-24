import { MqttNotificationType } from '../../../../common/service/notificator/enum/MqttNotificationType.enum';
import MQTTConnector from '../../../../common/service/notificator/MQTTConnector';
import ClanNotifier from '../../../../clan/clan.notifier';
import RoomRemovalNotifier from '../../../../clanInventory/room/roomRemoval.notifier';
import StockNotifier from '../../../../clanInventory/stock/stock.notifier';
import DailyTaskNotifier from '../../../../dailyTasks/dailyTask.notifier';
import DailyTasksResetNotifier from '../../../../dailyTasks/dailyTaskReset.notifier';
import { UITaskName } from '../../../../dailyTasks/enum/uiTaskName.enum';
import FriendshipNotifier from '../../../../friendship/friendship.notifier';
import JukeboxNotifier from '../../../../jukebox/jukebox.notifier';
import { MatchmakingNotifier } from '../../../../matchmaking/matchmaking.notifier';
import { MatchType } from '../../../../matchmaking/enum/matchType.enum';
import { InviteStatus } from '../../../../matchmaking/enum/inviteStatus.enum';
import { MatchStatus } from '../../../../matchmaking/enum/matchStatus.enum';
import { TeamSide } from '../../../../matchmaking/enum/teamSide.enum';
import VotingNotifier from '../../../../voting/voting.notifier';
import { VotingType } from '../../../../voting/enum/VotingType.enum';
import { NotificationStatus } from '../../../../common/service/notificator/enum/NotificationStatus.enum';
import { NotificationResource } from '../../../../common/service/notificator/enum/NotificationResource.enum';

jest.mock('../../../../common/service/notificator/MQTTConnector', () => ({
  getInstance: jest.fn(),
}));

describe('MQTT notification contract', () => {
  let publishMock: jest.Mock;

  beforeEach(() => {
    publishMock = jest.fn();
    (MQTTConnector.getInstance as jest.Mock).mockReturnValue({
      publish: publishMock,
    });
  });

  function expectLastPayloadToMatchEnvelope(topic: string, type: string) {
    const lastCall = publishMock.mock.calls[publishMock.mock.calls.length - 1];
    const payload = JSON.parse(lastCall[1]);

    expect(payload).toEqual({
      topic,
      type,
      payload: expect.anything(),
    });
    expect(typeof payload.payload).toBe('object');
  }

  it('wraps jukebox notifications', async () => {
    const notifier = new JukeboxNotifier();

    await notifier.songChange({ songId: 'song-1', startedAt: 1 }, 'clan-1');
    expectLastPayloadToMatchEnvelope(
      'jukebox',
      MqttNotificationType.SONG_UPDATED,
    );

    await notifier.playlistUpdate(
      { clanId: 'clan-1', currentSong: null, songQueue: [] },
      'clan-1',
    );
    expectLastPayloadToMatchEnvelope(
      'jukebox',
      MqttNotificationType.PLAYLIST_UPDATED,
    );
  });

  it('wraps matchmaking notifications', async () => {
    const notifier = new MatchmakingNotifier();
    const invite = {
      id: 'invite-1',
      matchType: MatchType.RANDOM,
      status: InviteStatus.QUEUED,
      ownerPlayerId: 'player-1',
      players: [{ playerId: 'player-1', name: 'Player 1', avatar: null }],
      bots: [],
      teamSize: 2 as const,
      allowBots: true,
      createdAt: '2026-07-06T08:00:00.000Z',
      updatedAt: '2026-07-06T08:00:01.000Z',
    };
    const match = {
      id: 'match-1',
      matchType: MatchType.RANDOM,
      status: MatchStatus.ACTIVE,
      teamSize: 2 as const,
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

    await notifier.inviteUpdated('player-1', invite);
    expectLastPayloadToMatchEnvelope(
      'matchmaking',
      MqttNotificationType.ROOM_UPDATED,
    );

    await notifier.inviteReceived(
      'player-2',
      MqttNotificationType.INVITE_RECEIVED,
      {
        id: invite.id,
        matchType: invite.matchType,
        status: invite.status,
        ownerPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        senderPlayer: { playerId: 'player-1', name: 'Player 1', avatar: null },
        teamSize: invite.teamSize,
        allowBots: invite.allowBots,
        sentAt: '2026-07-06T08:00:03.000Z',
      },
    );
    expectLastPayloadToMatchEnvelope(
      'matchmaking',
      MqttNotificationType.INVITE_RECEIVED,
    );

    await notifier.matchFound('player-1', match);
    expectLastPayloadToMatchEnvelope(
      'matchmaking',
      MqttNotificationType.MATCH_FOUND,
    );

    await notifier.matchEvent(
      'match-1',
      MqttNotificationType.MATCH_STARTED,
      match,
    );
    expectLastPayloadToMatchEnvelope(
      'matchmaking',
      MqttNotificationType.MATCH_STARTED,
    );
  });

  it('wraps voting notifications while preserving the voting payload fields', async () => {
    const notifier = new VotingNotifier();
    const voting = {
      _id: { toString: () => 'voting-1' },
      organizer: { clan_id: 'clan-1' },
      type: VotingType.FLEA_MARKET_SELL_ITEM,
    } as any;
    const entity = { itemId: 'item-1' };
    const player = { _id: 'player-1' } as any;

    await notifier.newVoting(voting, entity, player);
    expectLastPayloadToMatchEnvelope(
      'voting',
      MqttNotificationType.VOTING_CREATED,
    );

    await notifier.votingUpdated(voting, entity, player);
    expectLastPayloadToMatchEnvelope(
      'voting',
      MqttNotificationType.VOTING_UPDATED,
    );

    await notifier.votingCompleted(voting, entity);
    expectLastPayloadToMatchEnvelope(
      'voting',
      MqttNotificationType.VOTING_ENDED,
    );

    notifier.votingError('clan-1', VotingType.FLEA_MARKET_SELL_ITEM, {
      name: 'APIError',
    } as any);
    expectLastPayloadToMatchEnvelope(
      'voting',
      MqttNotificationType.VOTING_ERROR,
    );

    const secondToLastCall =
      publishMock.mock.calls[publishMock.mock.calls.length - 2];
    const lastPayload = JSON.parse(secondToLastCall[1]);
    expect(lastPayload.payload).toEqual(
      expect.objectContaining({
        status: NotificationStatus.END,
        voting_id: 'voting-1',
        type: VotingType.FLEA_MARKET_SELL_ITEM,
        entity,
      }),
    );
  });

  it('wraps daily task notifications', () => {
    const notifier = new DailyTaskNotifier();
    const task = { type: UITaskName.CHANGE_LANGUAGE };

    notifier.taskReceived('player-1', task);
    expectLastPayloadToMatchEnvelope(
      'daily_task',
      MqttNotificationType.TASK_RECEIVED,
    );

    notifier.taskUpdated('player-1', task);
    expectLastPayloadToMatchEnvelope(
      'daily_task',
      MqttNotificationType.TASK_UPDATED,
    );

    notifier.taskCompleted('player-1', task);
    expectLastPayloadToMatchEnvelope(
      'daily_task',
      MqttNotificationType.TASK_COMPLETED,
    );

    notifier.taskCompletedForClan('clan-1', task, 'player-1');
    expectLastPayloadToMatchEnvelope(
      'daily_task',
      MqttNotificationType.CLAN_TASK_COMPLETED,
    );

    notifier.milestoneReached('clan-1', task, 'player-1', [100]);
    expectLastPayloadToMatchEnvelope(
      'daily_task',
      MqttNotificationType.MILESTONE_REACHED,
    );
  });

  it('wraps reset, clan, friendship, and inactive room notifications', async () => {
    new ClanNotifier().memberJoin('clan-1', 'player-1');
    expectLastPayloadToMatchEnvelope(
      'clan',
      MqttNotificationType.MEMBER_JOINED,
    );

    new ClanNotifier().memberLeave('clan-1', 'player-1');
    expectLastPayloadToMatchEnvelope('clan', MqttNotificationType.MEMBER_LEFT);

    const friendshipNotifier = new FriendshipNotifier({
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({
              _id: { toString: () => 'player-1' },
              name: 'Player 1',
              avatar: null,
              clan_id: { toString: () => 'clan-1' },
              Clan: { name: 'Clan 1' },
            }),
          }),
        }),
      }),
    } as any);
    const friendship = {
      _id: { toString: () => 'friendship-1' },
      requester: 'player-1',
      playerB: { toString: () => 'player-2' },
    } as any;

    await friendshipNotifier.newFriendRequest(friendship);
    expectLastPayloadToMatchEnvelope(
      'friendship',
      MqttNotificationType.FRIEND_REQUEST_CREATED,
    );

    await friendshipNotifier.friendRequestAccepted(friendship, 'player-2');
    expectLastPayloadToMatchEnvelope(
      'friendship',
      MqttNotificationType.FRIEND_REQUEST_ACCEPTED,
    );

    await friendshipNotifier.friendRequestRejected(friendship, 'player-2');
    expectLastPayloadToMatchEnvelope(
      'friendship',
      MqttNotificationType.FRIEND_REQUEST_REJECTED,
    );

    await new DailyTasksResetNotifier().dailyTasksReset();
    expectLastPayloadToMatchEnvelope(
      'daily_task',
      MqttNotificationType.DAILY_TASKS_RESET,
    );

    await new RoomRemovalNotifier().roomRemoval();
    expectLastPayloadToMatchEnvelope(
      'inactive_room',
      MqttNotificationType.INACTIVE_ROOMS_REMOVED,
    );
  });

  it('wraps stock notifications and publishes them to clan stock topics', () => {
    const notifier = new StockNotifier();
    const item = {
      _id: 'item-1',
      name: 'Sofa_Taakka' as any,
      unityKey: 'Sofa_Taakka',
      isFurniture: true,
      furnitureSize: [2, 2],
      price: 100,
    };

    notifier.itemAdded({
      clan_id: 'buyer-clan',
      stock_id: 'stock-1',
      item,
      source: 'flea_market_direct',
      sellerClan_id: 'seller-clan',
      buyerClan_id: 'buyer-clan',
      fleaMarketItem_id: 'fm-item-1',
    });

    expect(publishMock).toHaveBeenLastCalledWith(
      `/clan/buyer-clan/${NotificationResource.STOCK}/item/new`,
      expect.any(String),
    );
    expectLastPayloadToMatchEnvelope(
      'stock',
      MqttNotificationType.STOCK_ITEM_ADDED,
    );

    notifier.itemRemoved({
      clan_id: 'seller-clan',
      item,
      source: 'flea_market_direct',
      sellerClan_id: 'seller-clan',
      buyerClan_id: 'buyer-clan',
      fleaMarketItem_id: 'fm-item-1',
    });

    expect(publishMock).toHaveBeenLastCalledWith(
      `/clan/seller-clan/${NotificationResource.STOCK}/item/update`,
      expect.any(String),
    );
    expectLastPayloadToMatchEnvelope(
      'stock',
      MqttNotificationType.STOCK_ITEM_REMOVED,
    );
  });

  it('does not publish stock notifications for non-furniture items or same-clan removals', () => {
    const notifier = new StockNotifier();
    const initialCallCount = publishMock.mock.calls.length;
    const item = {
      _id: 'item-1',
      name: 'Sofa_Taakka' as any,
      unityKey: 'Sofa_Taakka',
      isFurniture: false,
      furnitureSize: [2, 2],
      price: 100,
    };

    notifier.itemAdded({
      clan_id: 'clan-1',
      stock_id: 'stock-1',
      item,
      source: 'clan_shop_direct',
    });
    notifier.itemRemoved({
      clan_id: 'clan-1',
      item: { ...item, isFurniture: true },
      source: 'flea_market_direct',
      sellerClan_id: 'clan-1',
      buyerClan_id: 'clan-1',
    });

    expect(publishMock).toHaveBeenCalledTimes(initialCallCount);
  });
});
