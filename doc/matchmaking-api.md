# Matchmaking API

The matchmaking HTTP API is exposed under `/matchmaking`. All endpoints use the
authenticated player's `player_id` from the request context.

The room endpoints describe matchmaking room state. The invite endpoints describe
explicit notifications sent to players so they can join an existing room.

## Room Lifecycle

1. A player creates a room with `POST /matchmaking/rooms`.
2. Other players may join the room with `POST /matchmaking/rooms/{roomId}/join`.
3. When the room has a playable composition, the owner starts matchmaking with
   `POST /matchmaking/rooms/{roomId}/start`.
4. When matchmaking creates an active match, clients join the Photon Room.
5. Each real player confirms Photon readiness with
   `POST /matchmaking/matches/{matchId}/start`.
6. The match is finished with `POST /matchmaking/matches/{matchId}/finish`.

Bots can fill missing player slots when `allowBots` is enabled. Bots are not
expected to call HTTP endpoints.

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
- `teamSize` defaults to the service default when omitted.
- `allowBots` defaults to the service default when omitted.
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
```

## List Rooms

```http
GET /matchmaking/rooms
```

Lists rooms visible to the authenticated player. Visibility depends on ownership,
current membership, custom rooms, and clan membership for clan rooms.

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

Adds the authenticated player to an existing room.

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

## Start Matchmaking For Room

```http
POST /matchmaking/rooms/{roomId}/start
```

Starts matchmaking for a ready room. This must be called by the room owner. The
endpoint is used to ensure the owner explicitly starts matchmaking only after the
players are ready.

### Response

Returns the updated `MatchmakingInviteDto`. Once matched, the room includes
`matchId`.

## Cancel Room

```http
DELETE /matchmaking/rooms/{roomId}
```

Cancels an open room owned by the authenticated player.

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
    winningSide: 'A' | 'B'
  }
}
```

## Finish Match

```http
POST /matchmaking/matches/{matchId}/finish
```

Finishes an active match, updates leaderboards, and stores the finished match for
a short read-after-finish window.

### Request Body

```ts
{
  winningSide: 'A' | 'B'
}
```

### Response

Returns the finished `MatchmakingMatchDto`.
