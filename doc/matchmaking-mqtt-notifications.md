# Matchmaking MQTT Notifications

The backend publishes matchmaking room, invite, and match lifecycle events
through MQTT. The implementation lives in
`src/matchmaking/matchmaking.notifier.ts`, and the state changes that trigger the
events are handled by `src/matchmaking/matchmaking.service.ts`.

Matchmaking broker topics currently start with `/`. Frontend subscriptions must
use the exact topic strings shown below.

## Subscribe Topics

```text
/matchmaking/rooms/player/{playerId}
/matchmaking/invites/player/{playerId}
/matchmaking/matches/player/{playerId}
/match/{matchId}
```

Where:

- `{playerId}` is the authenticated player's player id.
- `{matchId}` is the match id returned in a `MATCH_FOUND` payload.

## Common Payload Shape

All matchmaking MQTT messages use the common notification envelope:

```ts
{
  topic: 'matchmaking',
  type: string,
  payload: unknown
}
```

The `topic` field identifies the logical notification area. The MQTT broker
topic used for publish/subscribe is separate from this field.

## Compact Player Shape

All real players in matchmaking MQTT payloads use the same compact player shape:

```ts
{
  playerId: string,
  name: string,
  avatar: AvatarDto | null
}
```

This applies to room players, invite owner/sender fields, and match team
players. Full player documents are not sent through matchmaking MQTT messages.
Bots are kept separate from real players and use the bot shape shown in the
payload examples.

## 1. Room Updated

### Topic

```text
/matchmaking/rooms/player/{playerId}
```

### Event Type

```text
ROOM_UPDATED
```

### Publish Triggers

- A player creates a matchmaking room.
- A player joins a room.
- A room status changes.
- A room starts searching, receives a bot offer, is matched, or is cancelled.

The notification is sent to every real player currently attached to the room.
Bots do not receive MQTT notifications.

### Payload Shape

Room updates use a compact room payload with one room identifier: `id`.

```ts
{
  topic: 'matchmaking',
  type: 'ROOM_UPDATED',
  payload: {
    id: string,
    matchType: 'RANDOM' | 'CLAN' | 'CUSTOM',
    gameType: number,
    status: 'OPEN' | 'READY' | 'QUEUED' | 'SEARCHING' | 'BOT_OFFERED' |
      'MATCHED' | 'CANCELLED' | 'EXPIRED',
    ownerPlayerId: string,
    clanId?: string,
    players: [
      {
        playerId: string,
        name: string,
        avatar: AvatarDto | null
      }
    ],
    bots: [
      {
        botId: string,
        displayName: string,
        isBot: true
      }
    ],
    teamSize: 1 | 2,
    allowBots: boolean,
    stateVersion: number,
    createdAt: string,
    updatedAt: string,
    readyAt?: string,
    searchStartedAt?: string,
    botOfferCreatedAt?: string,
    botOfferExpiresAt?: string
  }
}
```

## 2. Invite Received

### Topic

```text
/matchmaking/invites/player/{playerId}
```

### Event Types

```text
INVITE_RECEIVED
CLAN_INVITE_RECEIVED
```

### Publish Triggers

- `POST /matchmaking/invites/{playerId}` sends `INVITE_RECEIVED`.
- `POST /matchmaking/invites/clan` sends `CLAN_INVITE_RECEIVED`.
- `POST /matchmaking/rooms` with `automaticInvite.type: 'PLAYER'` sends
  `INVITE_RECEIVED`.
- `POST /matchmaking/rooms` with `automaticInvite.type: 'CLAN'` sends
  `CLAN_INVITE_RECEIVED`.

This topic is only for explicit invitations into a specific existing room.

### Payload Shape

```ts
{
  topic: 'matchmaking',
  type: 'INVITE_RECEIVED' | 'CLAN_INVITE_RECEIVED',
  payload: {
    id: string,
    matchType: 'RANDOM' | 'CLAN' | 'CUSTOM',
    gameType: number,
    status: 'OPEN' | 'READY' | 'QUEUED' | 'SEARCHING' | 'BOT_OFFERED' |
      'MATCHED' | 'CANCELLED' | 'EXPIRED',
    ownerPlayer: {
      playerId: string,
      name: string,
      avatar: AvatarDto | null
    },
    senderPlayer: {
      playerId: string,
      name: string,
      avatar: AvatarDto | null
    },
    teamSize: 1 | 2,
    allowBots: boolean,
    sentAt: string
  }
}
```

## 3. RANDOM Bot Opponent Offer

### Topic

```text
/matchmaking/rooms/player/{playerId}
```

### Event Types

```text
BOT_OPPONENT_OFFERED
BOT_OPPONENT_DECLINED
```

`BOT_OPPONENT_OFFERED` is published when a RANDOM human-opponent search has run
for 20 seconds without finding a match. It is a pending offer only; no match or
bot participant exists until the player accepts through the HTTP API.

`BOT_OPPONENT_DECLINED` is published when the player declines the offer or when
another cancellation path invalidates it. `ROOM_UPDATED` is also published for
both state transitions and remains the authoritative room snapshot.

### Payload Shape

```ts
{
  topic: 'matchmaking',
  type: 'BOT_OPPONENT_OFFERED' | 'BOT_OPPONENT_DECLINED',
  payload: {
    roomId: string,
    status: 'BOT_OFFERED' | 'CANCELLED',
    offeredAt: string,
    expiresAt?: string,
    updatedAt: string
  }
}
```

When `BOT_OPPONENT_OFFERED` is received, the client may call either:

```text
POST /matchmaking/rooms/{roomId}/bot-offer/accept
POST /matchmaking/rooms/{roomId}/bot-offer/decline
```

Acceptance produces the normal `MATCH_FOUND` event. It does not produce a
separate bot-offer-accepted event.

## 4. Match Found

### Topic

```text
/matchmaking/matches/player/{playerId}
```

### Event Type

```text
MATCH_FOUND
```

### Publish Triggers

- Searching `RANDOM` requests are paired into a human 1v1 match.
- A RANDOM player explicitly accepts a pending bot-opponent offer.
- Ready `CLAN` rooms from different clans are paired.
- A `CLAN` room reaches the opponent timeout and receives a bot opponent team.
- A `CUSTOM` room starts a match from its room settings.

This notification is sent once to each real player in the created match. Bots are
included in the match payload but do not receive player-specific notifications.

### Payload Shape

```ts
{
  topic: 'matchmaking',
  type: 'MATCH_FOUND',
  payload: MatchmakingMqttMatchDto
}
```

`MatchmakingMqttMatchDto` has this shape:

```ts
{
  id: string,
  matchType: 'RANDOM' | 'CLAN' | 'CUSTOM',
  gameType: number,
  status: 'ACTIVE' | 'FINISHED',
  teamSize: 1 | 2,
  teams: [
    {
      side: 'A' | 'B',
      clanId?: string,
      players: [
        {
          playerId: string,
          name: string,
          avatar: AvatarDto | null
        }
      ],
      bots: [
        {
          botId: string,
          displayName: string,
          isBot: true
        }
      ]
    }
  ],
  startedAt: string,
  readyPlayerIds?: string[],
  battleStartedAt?: string,
  finishedAt?: string,
  result?: {
    winningSide: 'A' | 'B'
  }
}
```

RANDOM never sends a 2v2 `MATCH_FOUND` payload. RANDOM bot matches contain the
human on one side and exactly one bot on the other. Clan membership does not
affect RANDOM pairing.

## 5. Match Started

### Topic

```text
/match/{matchId}
```

### Event Type

```text
MATCH_STARTED
```

### Publish Triggers

- Every real participant in an active match has called
  `POST /matchmaking/matches/{matchId}/start`.

Bots do not need to confirm Photon Room readiness. `MATCH_STARTED` is not sent
when the match is initially created; it is sent as a response to the readiness
calls from clients.

### Payload Shape

```ts
{
  topic: 'matchmaking',
  type: 'MATCH_STARTED',
  payload: MatchmakingMqttMatchDto
}
```

The payload includes `readyPlayerIds` and `battleStartedAt` after all real
players are ready.

## 6. Match Finished

### Topic

```text
/match/{matchId}
```

### Event Type

```text
MATCH_FINISHED
```

### Publish Triggers

- A participant finishes an active match through
  `POST /matchmaking/matches/{matchId}/finish`.
- The backend accepts the finish request, updates leaderboards, stores the
  finished match with the finished-match TTL, and invalidates leaderboard caches.

Acceptance here means that an authenticated match participant submitted a
valid finish request for an active match. The backend owns the resulting
`FINISHED` transition and `finishedAt` timestamp. The current protocol does not
independently validate the winning side against Photon events or require result
consensus from both teams.

The payload contains the finished match with `status: 'FINISHED'`, `finishedAt`,
and `result`.

### Payload Shape

```ts
{
  topic: 'matchmaking',
  type: 'MATCH_FINISHED',
  payload: MatchmakingMqttMatchDto
}
```

## Frontend Handling

Recommended frontend flow:

1. Subscribe to `/matchmaking/rooms/player/{playerId}` after login.
2. Subscribe to `/matchmaking/invites/player/{playerId}` to receive explicit
   room invitations.
3. Subscribe to `/matchmaking/matches/player/{playerId}` while the player is in
   matchmaking.
4. Use `ROOM_UPDATED` to keep room and lobby UI synchronized, including
   `SEARCHING`, `BOT_OFFERED`, and terminal states.
5. Use `BOT_OPPONENT_OFFERED` to show the accept/decline UI, and
   `BOT_OPPONENT_DECLINED` to close it when the offer is invalidated.
6. Use `INVITE_RECEIVED` and `CLAN_INVITE_RECEIVED` to show incoming room
   invitations.
7. When `MATCH_FOUND` is received, read `message.payload.id`, join the Photon
   Room, call `POST /matchmaking/matches/{matchId}/start`, and subscribe to
   `/match/{matchId}`.
8. Use `MATCH_STARTED` to start the clientside battle once every real player is
   ready.
9. Use `MATCH_FINISHED` to show the result screen and refresh leaderboard views.

## Notes

- MQTT payloads are JSON strings produced with `JSON.stringify`.
- Room and match data are stored in Redis, so clients should treat these events
  as real-time state notifications rather than durable history.
- `RANDOM` means Ego Clash and is always 1v1. `CUSTOM` is the mode for 2v2 and
  freely selected bot participation. `CLAN` has a separate automatic bot-timeout
  policy and must not be used as the RANDOM implementation.
- Practice or tutorial gameplay does not alter matchmaking state. Keep the
  player room and match subscriptions active if matchmaking should continue in
  the background.
- `CLAN` match finishes update both clan leaderboards and personal leaderboards
  for participating clan players. `RANDOM` and `CUSTOM` finishes update only
  personal leaderboards.
