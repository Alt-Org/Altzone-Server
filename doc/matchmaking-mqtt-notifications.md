# Matchmaking MQTT Notifications

The backend publishes matchmaking invite and match lifecycle events through MQTT.
The implementation lives in `src/matchmaking/matchmaking.notifier.ts`, and the
state changes that trigger the events are handled by
`src/matchmaking/matchmaking.service.ts`.

Matchmaking topics currently start with `/`. Frontend subscriptions must use
the exact topic strings shown below.

## Subscribe Topics

A frontend client should subscribe to player-specific channels for the logged-in
player and to match-specific channels after a match has been created.

```text
/matchmaking/invites/player/{playerId}
/matchmaking/matches/player/{playerId}
/match/{matchId}
```

Where:

- `{playerId}` is the authenticated player's player id.
- `{matchId}` is the match id returned in a `MATCH_FOUND` or `MATCH_STARTED`
  payload.

## Common Payload Shape

All matchmaking MQTT messages use the same wrapper shape:

```ts
{
  type: string,
  payload: unknown
}
```

The `type` field identifies the event. The `payload` field contains either a
`MatchmakingInviteDto` or a `MatchmakingMatchDto`, depending on the event.

## 1. Invite Update Notification

### Topic

```text
/matchmaking/invites/player/{playerId}
```

### Event Type

```text
INVITE_UPDATED
```

### Publish Triggers

- A player creates a matchmaking invite.
- A player joins an invite.
- An invite is moved forward by matchmaking and its status changes.
- An invite is matched into an active match.
- An invite is cancelled by its owner.

The notification is sent to every real player currently attached to the invite.
Bots do not receive MQTT notifications.

### Payload Shape

```ts
{
  type: 'INVITE_UPDATED',
  payload: {
    id: string,
    matchType: 'RANDOM' | 'CLAN' | 'CUSTOM',
    status: 'OPEN' | 'READY' | 'QUEUED' | 'MATCHED' | 'CANCELLED',
    ownerPlayerId: string,
    clanId?: string,
    roomId?: string,
    players: string[],
    bots: [
      {
        botId: string,
        displayName: string,
        isBot: true
      }
    ],
    teamSize: 1 | 2,
    allowBots: boolean,
    createdAt: string,
    updatedAt: string,
    readyAt?: string,
    matchId?: string
  }
}
```

## 2. Player Match Found Notification

### Topic

```text
/matchmaking/matches/player/{playerId}
```

### Event Type

```text
MATCH_FOUND
```

### Publish Triggers

- Two READY `RANDOM` invites are paired.
- Two READY `CLAN` invites from different clans are paired.
- A `CLAN` invite reaches the opponent timeout and receives a bot opponent team.
- A `CUSTOM` invite starts a match from its room settings.

This notification is sent once to each real player in the created match. Bots are
included in the match payload but do not receive player-specific notifications.

### Payload Shape

```ts
{
  type: 'MATCH_FOUND',
  payload: MatchmakingMatchDto
}
```

`MatchmakingMatchDto` has this shape:

```ts
{
  id: string,
  matchType: 'RANDOM' | 'CLAN' | 'CUSTOM',
  status: 'ACTIVE' | 'FINISHED',
  teamSize: 1 | 2,
  teams: [
    {
      side: 'A' | 'B',
      clanId?: string,
      players: [
        {
          playerId: string,
          isBot: false
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
  finishedAt?: string,
  result?: {
    winningSide: 'A' | 'B'
  }
}
```

## 3. Match Started Event

### Topic

```text
/match/{matchId}
```

### Event Type

```text
MATCH_STARTED
```

### Publish Triggers

- Any active match is created and persisted in Redis.

The payload is the same `MatchmakingMatchDto` that is sent with `MATCH_FOUND`.
This topic is useful for clients that have already switched from the player-level
matchmaking channel to a match-level game channel.

### Payload Shape

```ts
{
  type: 'MATCH_STARTED',
  payload: MatchmakingMatchDto
}
```

## 4. Match Finished Event

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

The payload contains the finished match with `status: 'FINISHED'`, `finishedAt`,
and `result`.

### Payload Shape

```ts
{
  type: 'MATCH_FINISHED',
  payload: MatchmakingMatchDto
}
```

## Frontend Handling

Recommended frontend flow:

1. Subscribe to `/matchmaking/invites/player/{playerId}` after login.
2. Subscribe to `/matchmaking/matches/player/{playerId}` while the player is in
   matchmaking.
3. Use `INVITE_UPDATED` to keep lobby and invite UI synchronized.
4. When `MATCH_FOUND` is received, read `payload.id` and subscribe to
   `/match/{matchId}`.
5. Use `MATCH_STARTED` to initialize the match scene if the client did not enter
   from the player-specific `MATCH_FOUND` event.
6. Use `MATCH_FINISHED` to show the result screen and refresh leaderboard views.

## Notes

- MQTT payloads are JSON strings produced with `JSON.stringify`.
- Invite and match data are stored in Redis, so clients should treat these events
  as real-time state notifications rather than durable history.
- `CLAN` match finishes update both clan leaderboards and personal leaderboards
  for participating clan players. `RANDOM` and `CUSTOM` finishes update only
  personal leaderboards.
