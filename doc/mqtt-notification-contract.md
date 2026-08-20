# MQTT Notification Contract

All MQTT notification payloads are JSON strings with the same top-level
envelope:

```ts
{
  topic: string,
  type: string,
  payload: object
}
```

- `topic` is the logical notification area, not the MQTT broker topic.
- `type` is the event type inside that area.
- `payload` contains the event data.

The MQTT broker topic used for publish/subscribe remains separate and is
documented per feature.

## Topics And Event Types

| Logical topic   | Event types                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `jukebox`       | `SONG_UPDATED`, `PLAYLIST_UPDATED`                                                                                               |
| `matchmaking`   | `ROOM_UPDATED`, `INVITE_RECEIVED`, `CLAN_INVITE_RECEIVED`, `MATCH_FOUND`, `MATCH_STARTED`, `MATCH_FINISHED`                     |
| `voting`        | `VOTING_CREATED`, `VOTING_UPDATED`, `VOTING_ENDED`, `VOTING_ERROR`                                                               |
| `daily_task`    | `TASK_RECEIVED`, `TASK_UPDATED`, `TASK_COMPLETED`, `TASK_ERROR`, `CLAN_TASK_COMPLETED`, `MILESTONE_REACHED`, `DAILY_TASKS_RESET` |
| `clan`          | `MEMBER_JOINED`, `MEMBER_LEFT`                                                                                                   |
| `friendship`    | `FRIEND_REQUEST_CREATED`, `FRIEND_REQUEST_ACCEPTED`, `FRIEND_REQUEST_REJECTED`                                                   |
| `inactive_room` | `INACTIVE_ROOMS_REMOVED`                                                                                                         |
| `stock`         | `STOCK_ITEM_ADDED`, `STOCK_ITEM_REMOVED`                                                                                         |

## Frontend Routing

```ts
const message = JSON.parse(rawMessage);

switch (message.topic) {
  case 'jukebox':
    handleJukebox(message.type, message.payload);
    break;
  case 'matchmaking':
    handleMatchmaking(message.type, message.payload);
    break;
  case 'voting':
    handleVoting(message.type, message.payload);
    break;
  case 'daily_task':
    handleDailyTask(message.type, message.payload);
    break;
  case 'clan':
    handleClan(message.type, message.payload);
    break;
  case 'friendship':
    handleFriendship(message.type, message.payload);
    break;
  case 'inactive_room':
    handleInactiveRoom(message.type, message.payload);
    break;
  case 'stock':
    handleStock(message.type, message.payload);
    break;
}
```

## Clan Member Notifications

Subscribe to clan member changes with:

```text
/clan/{clanId}/member/+/+
```

Published broker topics:

```text
/clan/{clanId}/member/join/new
/clan/{clanId}/member/leave/update
```

Payload examples:

```ts
{
  topic: 'clan',
  type: 'MEMBER_JOINED',
  payload: {
    topic: `/clan/${clanId}/member/join`,
    playerId: string,
    event: 'join',
    ts: number
  }
}
```

```ts
{
  topic: 'clan',
  type: 'MEMBER_LEFT',
  payload: {
    topic: `/clan/${clanId}/member/leave`,
    playerId: string,
    event: 'leave',
    ts: number
  }
}
```

## Friendship Notifications

New friend requests are published to:

```text
/player/{recipientId}/friendship/friend_request/new
```

Friend request status updates are published to:

```text
/player/{requesterId}/friendship/friend_request/accepted/update
/player/{requesterId}/friendship/friend_request/rejected/update
```

Payload:

```ts
{
  topic: 'friendship',
  type: 'FRIEND_REQUEST_CREATED',
  payload: {
    topic: `/player/${recipientId}/friendship/friend_request/new`,
    requester: object
  }
}
```

```ts
{
  topic: 'friendship',
  type: 'FRIEND_REQUEST_ACCEPTED' | 'FRIEND_REQUEST_REJECTED',
  payload: {
    topic: `/player/${requesterId}/friendship/friend_request/${status}/update`,
    friendship_id: string,
    status: 'accepted' | 'rejected',
    friend: object
  }
}
```

See [Friendship MQTT Notifications](friendship-mqtt-notifications.md) for the
full friendship-specific topic and payload contract.

## Inactive Room Notifications

Inactive room cleanup notifications are published to:

```text
/system/global/inactive_room/room_removal/update
```

Payload:

```ts
{
  topic: 'inactive_room',
  type: 'INACTIVE_ROOMS_REMOVED',
  payload: {
    topic: '/system/room/removal'
  }
}
```
