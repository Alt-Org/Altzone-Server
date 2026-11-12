# Production Leaderboard API Contract

This document defines the HTTP contract and terminology for the production,
win-based leaderboards. It is the source of truth for the four leaderboard
query endpoints described below. Implementing the queries is outside the scope
of this contract.

The existing `/leaderboard/player`, `/leaderboard/clan`, and
`/leaderboard/clan/position` endpoints are legacy battle-point endpoints. They
are not part of this contract and must not be used as aliases for these routes.

## Endpoints

```http
GET /leaderboards/players/global
GET /leaderboards/clans/global
GET /leaderboards/players/clan
GET /leaderboards/players/friends
```

| Endpoint                        | Authentication | Population                                      | `ownRank` refers to              |
| ------------------------------- | -------------- | ----------------------------------------------- | -------------------------------- |
| `/leaderboards/players/global`  | Optional       | All production players                          | Requesting player                |
| `/leaderboards/clans/global`    | Optional       | All production clans                            | Requesting player's current clan |
| `/leaderboards/players/clan`    | Required       | Members of the requesting player's current clan | Requesting player                |
| `/leaderboards/players/friends` | Required       | Requesting player and their accepted friends    | Requesting player                |

When authentication is optional, an invalid or expired bearer token returns
`401 Unauthorized`; it is not treated as an anonymous request. An anonymous
global request has `ownRank: null`.

## Terminology and Score Source

### Production leaderboard

A production leaderboard is a lifetime leaderboard derived only from accepted
battle results belonging to production gameplay. It must never combine data
from different data environments or server modes.

The following data is excluded:

- `TEACHING_DEMO` data;
- battles created in a `TESTING_SESSION` server mode;
- teaching/testing package-race results;
- open, processing, rejected, conflicting, cancelled, or otherwise
  non-final battle results.

### Accepted battle win

An accepted battle win is one authoritative battle result that the server has
finalized exactly once:

- the battle has a completed/final state;
- its authoritative winner is team 1 or team 2;
- the player belongs to the authoritative winning team; and
- the battle passes the production and package-race exclusions above.

Duplicate result submissions and multiple reports for the same battle count as
one battle. A player receives one win for an accepted battle regardless of the
number of result reports.

A clan receives one win when the authoritative winning side represents that
clan in an eligible clan battle. A regular battle without a winning clan does
not increase a clan's score. The implementation must not infer clan ownership
from a player's current clan after the battle has completed.

### Lifetime wins

`wins` is the number of accepted battle wins over the entity's complete
production history. It is a non-negative integer.

The leaderboard score is only `wins`. Activity points, daily-task points,
general player points, and `battlePoints` are not score inputs and must not be
included in leaderboard entries.

### Score reached time

`scoreReachedAt` is an internal ordering value and is not returned by the API.
For an entity with at least one win, it is the server-recorded completion time
of the accepted battle that produced the entity's current latest win. It must
come from the authoritative finalized battle record, not a client-provided
timestamp or result submission time.

For an entity with zero wins, `scoreReachedAt` is the entity creation time. If
legacy data lacks the required timestamp, the stable entity ID is used for the
remaining tie instead of using the current time. Rebuilding a leaderboard must
therefore not change ordering by itself.

## Eligibility and Ordering

All current production players are eligible for the global player leaderboard,
including players with zero wins. All current production clans are similarly
eligible for the global clan leaderboard. Deleted entities are not returned.

Each endpoint applies its population filter before assigning ranks. Rank is
one-based and contiguous: the first entry is rank 1, the second rank 2, and so
on. Equal win counts do not produce shared ranks.

Entries are ordered by:

1. `wins` descending;
2. `scoreReachedAt` ascending (the score was reached earlier first); and
3. stable entity ID ascending using the database's canonical ID ordering.

The same ordering must be used for the page entries and `ownRank` calculation.
Changing a nickname, avatar, clan name, or logo must not affect rank.

## Pagination

All endpoints support offset-based page pagination with the existing query
parameters:

| Parameter | Type    | Default | Rules                     |
| --------- | ------- | ------- | ------------------------- |
| `page`    | integer | `1`     | Minimum `1`               |
| `limit`   | integer | `20`    | Minimum `1`, maximum `50` |

Invalid, fractional, repeated, or non-numeric values return `400 Bad Request`.
Values are not silently clamped. Omitting both parameters requests the first 20
entries.

`paginationData.itemCount` and `paginationData.pageCount` describe the filtered
population for the endpoint, not the global population. They are always
returned. An empty population has `itemCount: 0` and `pageCount: 0`.

Requesting a page after the last page is valid and returns `entries: []` with
the requested `currentPage`. It does not return `404`. `ownRank` is calculated
over the complete filtered population and does not depend on the requested
page.

## Response Models

### Avatar

The `avatar` value uses the same representation as `AvatarDto`:

```ts
type AvatarPiece = {
  id: number;
  color: string; // hexadecimal color
};

type Avatar = {
  head: AvatarPiece;
  hair: AvatarPiece;
  eyes: AvatarPiece;
  nose: AvatarPiece;
  mouth: AvatarPiece;
  eyebrows: AvatarPiece;
  clothes: AvatarPiece;
  feet: AvatarPiece;
  hands: AvatarPiece;
  skinColor: string; // hexadecimal color
};
```

### Clan logo and summary

The `logo` value uses the same representation as `ClanLogoDto`.

```ts
type ClanLogo = {
  logoType: string;
  pieceColors: string[]; // hexadecimal colors
};

type LeaderboardClanSummary = {
  clanId: string;
  name: string;
  logo: ClanLogo;
};
```

### Player entry

```ts
type PlayerLeaderboardEntry = {
  rank: number;
  wins: number;
  playerId: string;
  nickname: string;
  avatar: Avatar;
  clan: LeaderboardClanSummary | null;
};
```

`clan` is `null` when the player has no current clan. Player identity and clan
presentation fields reflect current data even though the score is lifetime
data.

### Clan entry

```ts
type ClanLeaderboardEntry = {
  rank: number;
  wins: number;
  clanId: string;
  name: string;
  logo: ClanLogo;
};
```

### Success envelope

All four endpoints return the common API envelope. `entries` contains either
player or clan entries depending on the endpoint.

```ts
type LeaderboardResponse<T> = {
  data: {
    leaderboard: {
      entries: T[];
      ownRank: number | null;
    };
  };
  metaData: {
    dataKey: 'leaderboard';
    modelName: 'Leaderboard';
    dataType: 'Object';
    dataCount: 1;
  };
  paginationData: {
    currentPage: number;
    limit: number;
    offset: number;
    itemCount: number;
    pageCount: number;
  };
};
```

`offset` is `(currentPage - 1) * limit`. `ownRank` is a positive integer when
the relevant authenticated player or clan belongs to the endpoint population;
otherwise it is `null`.

Leaderboard responses must not expose internal ordering timestamps, battle
records, activity points, daily-task points, general points, or battle points.

## Endpoint Semantics

### Global player leaderboard

```http
GET /leaderboards/players/global?page=1&limit=20
```

Returns all eligible production players. Authentication is optional. For an
authenticated request, `ownRank` is the requesting player's global player rank.
For an anonymous request, it is `null`.

### Global clan leaderboard

```http
GET /leaderboards/clans/global?page=1&limit=20
```

Returns all eligible production clans. Authentication is optional. For an
authenticated player who currently belongs to a clan, `ownRank` is that clan's
global clan rank. It is `null` for an anonymous request or an authenticated
player without a clan.

### Own-clan member leaderboard

```http
GET /leaderboards/players/clan?page=1&limit=20
Authorization: Bearer <token>
```

Returns current members of the requesting player's current clan. Membership is
evaluated at request time; historical members are not included. Rank is local
to this clan population. The requesting player is included and `ownRank`
contains their clan-member rank.

If the requesting player has no current clan, the endpoint returns
`404 Not Found` with reason `NOT_FOUND` and field `clan_id`. An existing clan
with no eligible members is represented as a successful empty result, although
this should not normally occur while the requester is a member.

### Friends leaderboard

```http
GET /leaderboards/players/friends?page=1&limit=20
Authorization: Bearer <token>
```

Returns the requesting player plus players connected to them by a current
`accepted` friendship. Pending, rejected, removed, and one-sided requests are
excluded. Each player appears at most once. Rank is local to this population.

The requesting player is included even when they have no accepted friends, so
the population then contains one entry with `rank: 1` and `ownRank: 1`.

## Examples

### Player leaderboard response

```json
{
  "data": {
    "leaderboard": {
      "entries": [
        {
          "rank": 1,
          "wins": 42,
          "playerId": "6650f79d17f2c78f42f42a01",
          "nickname": "ShadowKnight",
          "avatar": {
            "head": { "id": 1, "color": "#FAD9B5" },
            "hair": { "id": 4, "color": "#3A2418" },
            "eyes": { "id": 2, "color": "#3366FF" },
            "nose": { "id": 1, "color": "#FAD9B5" },
            "mouth": { "id": 3, "color": "#CC6677" },
            "eyebrows": { "id": 2, "color": "#3A2418" },
            "clothes": { "id": 8, "color": "#22AA88" },
            "feet": { "id": 5, "color": "#222222" },
            "hands": { "id": 1, "color": "#FAD9B5" },
            "skinColor": "#FAD9B5"
          },
          "clan": {
            "clanId": "6650f79d17f2c78f42f42b02",
            "name": "Northern Lights",
            "logo": {
              "logoType": "Heart",
              "pieceColors": ["#FFFFFF", "#0055AA"]
            }
          }
        }
      ],
      "ownRank": 37
    }
  },
  "metaData": {
    "dataKey": "leaderboard",
    "modelName": "Leaderboard",
    "dataType": "Object",
    "dataCount": 1
  },
  "paginationData": {
    "currentPage": 1,
    "limit": 20,
    "offset": 0,
    "itemCount": 413,
    "pageCount": 21
  }
}
```

### Clan leaderboard response

```json
{
  "data": {
    "leaderboard": {
      "entries": [
        {
          "rank": 1,
          "wins": 250,
          "clanId": "6650f79d17f2c78f42f42b02",
          "name": "Northern Lights",
          "logo": {
            "logoType": "Heart",
            "pieceColors": ["#FFFFFF", "#0055AA"]
          }
        }
      ],
      "ownRank": null
    }
  },
  "metaData": {
    "dataKey": "leaderboard",
    "modelName": "Leaderboard",
    "dataType": "Object",
    "dataCount": 1
  },
  "paginationData": {
    "currentPage": 1,
    "limit": 20,
    "offset": 0,
    "itemCount": 18,
    "pageCount": 1
  }
}
```

### Empty page response

```json
{
  "data": {
    "leaderboard": {
      "entries": [],
      "ownRank": 37
    }
  },
  "metaData": {
    "dataKey": "leaderboard",
    "modelName": "Leaderboard",
    "dataType": "Object",
    "dataCount": 1
  },
  "paginationData": {
    "currentPage": 99,
    "limit": 20,
    "offset": 1960,
    "itemCount": 413,
    "pageCount": 21
  }
}
```

## Errors

Errors use the API's standard error envelope:

```ts
{
  statusCode: number;
  errors: Array<{
    statusCode: number;
    reason: string;
    message: string | null;
    field: string | null;
    value: unknown | null;
    additional: unknown | null;
  }>;
}
```

| Status                      | Reason                                                                | When                                                                  |
| --------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `400 Bad Request`           | `VALIDATION`, `NOT_NUMBER`, `LESS_THAN_MIN`, or `MORE_THAN_MAX`       | `page` or `limit` is invalid                                          |
| `401 Unauthorized`          | `NOT_AUTHENTICATED`, `INVALID_AUTH_TOKEN`, or `AUTHENTICATION_FAILED` | Authentication is required, or a supplied token is invalid            |
| `404 Not Found`             | `NOT_FOUND`                                                           | The own-clan endpoint is requested by a player without a current clan |
| `500 Internal Server Error` | `UNEXPECTED`                                                          | The server cannot build a consistent leaderboard response             |

Example invalid pagination response:

```json
{
  "statusCode": 400,
  "errors": [
    {
      "statusCode": 400,
      "reason": "LESS_THAN_MIN",
      "message": "page must be an integer greater than or equal to 1",
      "field": "page",
      "value": 0,
      "additional": null
    }
  ]
}
```

Example missing-clan response:

```json
{
  "statusCode": 404,
  "errors": [
    {
      "statusCode": 404,
      "reason": "NOT_FOUND",
      "message": "The requesting player does not belong to a clan",
      "field": "clan_id",
      "value": null,
      "additional": null
    }
  ]
}
```

An empty leaderboard, a player with no accepted friends, and an out-of-range
page are successful states and must not be represented as errors.
