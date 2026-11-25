# Matchmaking API

The matchmaking HTTP API is exposed under `/matchmaking`. All endpoints use the
authenticated player's `player_id` from the request context.

The room endpoints describe matchmaking room state. The invite endpoints describe
explicit notifications sent to players so they can join an existing room.

Mode names in the backend map to player-facing modes as follows:

- `RANDOM` is Ego Clash. It is always 1v1 and searches for a human opponent
  without using clan membership as a preference or requirement.
- `CUSTOM` is Custom. In the Ego Clash/Custom product boundary it is the mode
  for freely configured 1v1 or 2v2 player/bot compositions.
- `CLAN` is a separate backend mode with its own team and bot-timeout rules.

## Room Lifecycle

1. A player creates a room with `POST /matchmaking/rooms`.
2. Other players may join joinable `CLAN` or `CUSTOM` rooms with
   `POST /matchmaking/rooms/{roomId}/join`. RANDOM players are paired from the
   matchmaking queue instead of joining each other's rooms.
3. Before a match is created, any room member may leave with
   `POST /matchmaking/rooms/leave`.
4. When the room has a playable composition, the owner starts matchmaking with
   `POST /matchmaking/rooms/{roomId}/start`.
5. RANDOM searches for a human opponent for 20 seconds. If none is found, the
   player receives a bot offer and either accepts or declines it.
6. When matchmaking creates an active match, clients join the Photon Room.
7. Each real player confirms Photon readiness with
   `POST /matchmaking/matches/{matchId}/start`.
8. The match is finished with `POST /matchmaking/matches/{matchId}/finish`.

Bots can fill missing player slots in CUSTOM and CLAN rooms when `allowBots` is
enabled. RANDOM never fills the player's own team with bots. Its only bot is an
opposing 1v1 participant created after timeout and explicit acceptance. Bots are
not expected to call HTTP endpoints.

## Create Room

```http
POST /matchmaking/rooms
```

Creates a new matchmaking room for the authenticated player. Room creation does
not start matchmaking by itself; the owner must call the room start endpoint once
the room is ready.

### Request Body

```ts
{
  matchType: 'RANDOM' | 'CLAN' | 'CUSTOM',
  gameType?: number,
  roomId?: string,
  teamSize?: 1 | 2,
  allowBots?: boolean,
  automaticInvite?: {
    type: 'CLAN' | 'PLAYER',
    playerId?: string
  },
  clientVersion?: string
}
```

- `roomId` is required by the service for `CUSTOM` rooms.
- `gameType` is optional and defaults to `1`. When supplied, it separates
  otherwise compatible rooms into different matchmaking pools. Clients that do
  not expose multiple gameplay variants should omit it.
- RANDOM accepts only `teamSize: 1`; omitting it also resolves to `1`.
- RANDOM rejects `teamSize: 2`, `allowBots: true`, and `automaticInvite`.
- New CUSTOM rooms start without bots, including when `allowBots` is true.
  CUSTOM room responses include `playerPositions` (zero-based slots keyed by
  player ID), `readyPlayerIds` (initially empty), and `position` on each bot.
  Slots below `teamSize` belong to team A and the remaining slots to team B.
- RANDOM responses always contain `allowBots: false`.
- CUSTOM and CLAN accept `teamSize: 1 | 2` and retain their mode-specific bot
  defaults.
- `automaticInvite.type: 'PLAYER'` requires `automaticInvite.playerId` and sends
  an invite to that player after room creation.
- `automaticInvite.type: 'CLAN'` sends invites to available members of the
  owner's clan after room creation.

### Response

Returns `MatchmakingInviteDto`, which represents the created room:

```ts
{
  id: string,
  matchType: 'RANDOM' | 'CLAN' | 'CUSTOM',
  gameType: number,
  status: 'OPEN' | 'READY' | 'QUEUED' | 'SEARCHING' | 'BOT_OFFERED' |
    'MATCHED' | 'CANCELLED' | 'EXPIRED',
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
  stateVersion: number,
  createdAt: string,
  updatedAt: string,
  readyAt?: string,
  searchStartedAt?: string,
  botOfferCreatedAt?: string,
  botOfferExpiresAt?: string,
  matchId?: string
}
```

`stateVersion` is a server-managed, monotonically increasing version of the
room state. The backend increments it whenever the room moves to a new
matchmaking state, for example from `READY` to `SEARCHING` and then to
`BOT_OFFERED`, `MATCHED`, or `CANCELLED`. It is used together with atomic state
updates to prevent competing operations, such as a timeout and a cancellation,
from both changing the same room. Clients must not send or modify this value.
They may compare it with a previously received version and ignore an older HTTP
or MQTT representation of the room.

## List Rooms

```http
GET /matchmaking/rooms
```

Lists rooms visible to the authenticated player. `CANCELLED` and `MATCHED` rooms
are not included.

The authenticated player can see:

- rooms they own or have already joined;
- `CUSTOM` rooms;
- `CLAN` rooms belonging to their clan.

RANDOM rooms are not public join targets. A RANDOM owner can still read their own
room while it is searching or waiting for a bot-offer response.

### Response

Returns `MatchmakingInviteDto[]`.

## Get Room

```http
GET /matchmaking/rooms/{roomId}
```

Reads one room by matchmaking room id.

### Response

Returns `MatchmakingInviteDto`.

## Join Room

```http
POST /matchmaking/rooms/{roomId}/join
```

Adds the authenticated player to an existing joinable CLAN or CUSTOM room. Both
`OPEN` rooms and `READY` rooms containing a replaceable bot can be joined. When a
real player joins a bot-filled room, one bot is removed before the room
composition and status are recalculated. RANDOM rooms are already full at their
required one-player composition and are paired through the RANDOM queue.

Room joins are serialized per room. If another join is already being processed,
the request is rejected with `NOT_ALLOWED` and the client may retry. This prevents
multiple concurrent requests from taking the same final real-player slot.

### Request Body

```ts
{
  roomId: string,
  clientVersion?: string
}
```

`roomId` in the body is used as an extra guard for `CUSTOM` joins.

### Response

Returns the updated `MatchmakingInviteDto`.

## Leave Room

```http
POST /matchmaking/rooms/leave
```

Removes the authenticated player from their current matchmaking room. The
request does not include a room ID or a request body because a player can belong
to only one active matchmaking room.

If other players remain in the room:

- the departing player is removed from the room;
- ownership is transferred to the first remaining player when the owner leaves;
- bot fillers and the room's `OPEN` or `READY` status are recalculated;
- a queued room is removed from matchmaking before its updated state is saved;
- the remaining players receive a `ROOM_UPDATED` MQTT notification.

Leaving a RANDOM room during `SEARCHING` or `BOT_OFFERED` is treated as an
explicit cancellation. The state becomes `CANCELLED`, its queue entry and player
lookup are removed, and pending timeout work is invalidated. For other rooms, if
the departing player is the last player, the room and its matchmaking queue entry
are deleted.

The endpoint cannot be used after the room has reached `MATCHED` status.

### Response

Returns `204 No Content` when the player leaves successfully.

Returns `404 NOT_FOUND` when the authenticated player does not have an active
matchmaking room. A stale player-to-room lookup is removed when detected and
produces the same response.

## Change Position In A CUSTOM Room

`POST /matchmaking/rooms/changePosition` accepts `{ "position": 2 }`.
The authenticated player moves within their active CUSTOM room. Slot numbers
are zero-based and must be below `teamSize * 2`. A slot occupied by a
player or bot is unavailable. Selecting the current slot returns the current
room without changing its version.

A successful move returns the updated room, clears the moving player's lobby
readiness, and sends `ROOM_UPDATED` to all real players in the room. If a
concurrent update wins, fetch the latest room state before retrying.

## Toggle Readiness In A CUSTOM Room

`POST /matchmaking/rooms/ready` toggles the authenticated member's lobby
readiness in their active CUSTOM room. The request has no body. The response
and `ROOM_UPDATED` show the new `readyPlayerIds`. Joining or leaving clears
all lobby confirmations, and moving slots clears the moving player's confirmation.

When all slots are occupied and all real players are ready, the backend
creates the match and returns the room with status `MATCHED` and its
`matchId`. Bots count as ready. The owner receives `CUSTOM_MATCH_READY`
to initiate Photon setup, and the other players receive `MATCH_FOUND`.

## Toggle A Bot In A CUSTOM Room

`POST /matchmaking/rooms/bot` accepts `{ "position": 2 }`. The authenticated
owner can use it in an open or ready CUSTOM room with `allowBots: true`.
Positions are zero-based and must be below `teamSize * 2`.

An empty slot gets a bot, a bot-occupied slot is cleared, and a slot occupied
by a real player is rejected. A successful change clears all human lobby
confirmations, returns the updated room, and sends `ROOM_UPDATED` to everyone
in the room.

## Start Matchmaking For Room

```http
POST /matchmaking/rooms/{roomId}/start
```

Starts matchmaking for a ready room. This must be called by the room owner. The
endpoint is used to ensure the owner explicitly starts matchmaking only after the
players are ready.

For RANDOM this atomically changes `READY` to `SEARCHING`, records
`searchStartedAt`, enters the human-opponent queue, and schedules a 20-second
timeout. A compatible human produces a 1v1 match. If the timeout wins, the room
changes to `BOT_OFFERED`; no bot match is created automatically.

### Response

Returns the updated `MatchmakingInviteDto`. Once matched, the room includes
`matchId`.

## Accept RANDOM Bot Offer

```http
POST /matchmaking/rooms/{roomId}/bot-offer/accept
```

Only the RANDOM room owner may accept an offer in `BOT_OFFERED` state. Acceptance
atomically consumes the offer and creates one 1v1 human-versus-bot match. The
response is `MatchmakingMatchDto`. Repeating a successful request returns the
same match and does not create another one.

## Decline RANDOM Bot Offer

```http
POST /matchmaking/rooms/{roomId}/bot-offer/decline
```

Only the RANDOM room owner may decline an offer. Declining changes the request to
`CANCELLED`, removes active matchmaking lookups, invalidates timeout work, and
does not create a match. Repeating a successful decline is a no-op.

Returns `204 No Content`.

## Cancel Room

```http
DELETE /matchmaking/rooms/{roomId}
```

Cancels a room owned by the authenticated player before it is matched. This also
works during RANDOM `SEARCHING` and `BOT_OFFERED`, removes the queue entry and
player lookup, and invalidates delayed timeout work. `MATCHED` rooms cannot be
cancelled. Cancellation is idempotent.

## Send Player Invite

```http
POST /matchmaking/invites/{playerId}
```

Sends an invite notification to a specific player for the sender's active room.
This does not create a new room.

### Response

Returns the sender's active `MatchmakingInviteDto`.

## Send Clan Invite

```http
POST /matchmaking/invites/clan
```

Sends invite notifications to available members of the sender's clan for the
sender's active room. Players already in the room are skipped. This does not
create a new room.

### Response

Returns the sender's active `MatchmakingInviteDto`.

## Confirm Photon Room Readiness

```http
POST /matchmaking/matches/{matchId}/start
```

Confirms that the authenticated player has successfully joined the Photon Room
and is ready to start the Quantum simulation / clientside battle.

Only real match participants are required to call this endpoint. Bots are treated
as already ready. When every real participant has called it, the backend publishes
`MATCH_STARTED` to `/match/{matchId}`.

### Response

Returns `MatchmakingMatchDto`:

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
  readyPlayerIds?: string[],
  battleStartedAt?: string,
  finishedAt?: string,
  result?: {
    winningSide: 'A' | 'B',
    finishReason?: 'COMPLETED' | 'FORFEIT' | 'DISCONNECTED',
    teamScores?: Array<{ side: 'A' | 'B', score: number }>
  }
}
```

## Finish Match

```http
POST /matchmaking/matches/{matchId}/finish
```

Finishes an active match, updates leaderboards, stores permanent match history,
and keeps the finished Redis state for a short read-after-finish window.

This operation is the current server-side acceptance point for a matchmaking
result. The server accepts the result only when the requester is an
authenticated participant of the active match and the request passes finish
validation. After acceptance, the server assigns `finishedAt`, changes the
match to `FINISHED`, and records any eligible production leaderboard win from
that server-built state.

For eligible production 1v1 `RANDOM` and `CLAN` matches, human participants use
the normal scoring rules for the mode whether the opposing participant is a
human or a bot:

- a human winner receives the mode's win `battlePoints`, a played-match and
  won-match increment, an accepted player leaderboard win, and battle daily-task
  progress;
- a human loser receives the mode's loss `battlePoints`, a played-match
  increment, and battle daily-task progress;
- bots never receive leaderboard records, `battlePoints`, statistics, daily-task
  progress, or other player rewards;
- in `CLAN`, only sides containing a real player receive clan `battlePoints`,
  and a clan win is attributed to the `clanId` stored on the winning match side.

`CUSTOM`, 2v2, and `TESTING_SESSION` matches are outside this production reward
path. They can be finished normally, but do not apply these leaderboard,
statistics, `battlePoints`, clan, or daily-task updates.

The current protocol does not independently verify the reported winning side
against Photon events or require matching reports from both teams. Adding
signed game-server results or multi-player consensus would be a separate,
backwards-incompatible result-validation feature. Clients cannot increment the
production win counter directly.

### Request Body

```ts
{
  winningSide: 'A' | 'B';
  finishReason?: 'COMPLETED' | 'FORFEIT' | 'DISCONNECTED';
  teamScores?: [
    { side: 'A' | 'B'; score: number },
    { side: 'A' | 'B'; score: number }
  ];
}
```

`winningSide` remains required for backwards compatibility. `finishReason` and
`teamScores` are optional. When scores are supplied, both sides must appear
exactly once and each score must be a non-negative integer. These result details
are participant-reported under the current protocol and are stored in the
authoritative finalized record; the server does not currently verify them
against Photon events.

### Response

Returns the finished `MatchmakingMatchDto`.

The operation is idempotent after completion. While the finished Redis snapshot
exists it is returned directly. After its TTL expires, an authenticated match
participant receives the same result reconstructed from permanent history. A
retry cannot replace the stored winner, even when its request body differs from
the accepted result, and it does not reapply rewards or publish another finish
notification. A non-participant cannot use this fallback to read match history.

## Concurrency And Practice Mode

RANDOM assignment, timeout, cancellation, and bot acceptance use atomic Redis
state transitions. Only one operation can consume a request; delayed jobs always
verify the current state before acting.

Match finishing also uses a short-lived Redis lock to serialize concurrent
requests. Permanent match history and Mongo-backed reward changes are committed
in one transaction together with a durable, unique reward claim keyed by
`battleId`. The transaction covers player and clan win records, `battlePoints`,
and player/clan statistics. A failure rolls back the history, claim, and all
those changes. Repeated requests, concurrent requests, process restarts, and
loss of the finished Redis snapshot therefore cannot apply Mongo-backed rewards
more than once. Cache invalidation and external notifications occur only after a
successful commit.

Tutorial or practice gameplay is separate from this API. Entering or leaving it
does not create, cancel, or modify a matchmaking request. A client may keep its
matchmaking MQTT subscriptions active while practice gameplay is running.
