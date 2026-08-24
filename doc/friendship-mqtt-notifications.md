# Friendship MQTT Notifications

The backend publishes friendship request lifecycle notifications through MQTT
using the common topic format built by `NotificationSender`.

## Subscribe Topic

Frontend clients that need all friendship request updates for one player should
subscribe to:

```text
/player/{playerId}/friendship/friend_request/+/+
```

The published topics are:

```text
/player/{recipientId}/friendship/friend_request/new
/player/{requesterId}/friendship/friend_request/accepted/update
/player/{requesterId}/friendship/friend_request/rejected/update
```

Where:

- `{recipientId}` is the player who receives a new friend request.
- `{requesterId}` is the player who originally sent the friend request.

## Payload

All friendship notifications use the common MQTT envelope:

```ts
{
  topic: 'friendship',
  type:
    | 'FRIEND_REQUEST_CREATED'
    | 'FRIEND_REQUEST_ACCEPTED'
    | 'FRIEND_REQUEST_REJECTED',
  payload: object
}
```

The inner `payload.topic` identifies the logical friendship request event for
the frontend. It is not the MQTT broker topic.

## Friend Player Shape

Friendship MQTT payloads include compact player data for the relevant other
player:

```ts
{
  _id: string,
  name: string,
  avatar: unknown,
  clanName: string | null,
  clan_id: string
}
```

## Friend Request Created

Sent when a player successfully sends a new friend request.

### Published Topic

```text
/player/{recipientId}/friendship/friend_request/new
```

### Payload Shape

```ts
{
  topic: 'friendship',
  type: 'FRIEND_REQUEST_CREATED',
  payload: {
    topic: `/player/${recipientId}/friendship/friend_request/new`,
    requester: {
      friendship_id: string,
      friend: FriendPlayer
    }
  }
}
```

The `requester.friend` field contains the player who sent the request.

## Friend Request Accepted

Sent to the original requester when the recipient accepts a pending friend
request.

### Published Topic

```text
/player/{requesterId}/friendship/friend_request/accepted/update
```

### Payload Shape

```ts
{
  topic: 'friendship',
  type: 'FRIEND_REQUEST_ACCEPTED',
  payload: {
    topic: `/player/${requesterId}/friendship/friend_request/accepted/update`,
    friendship_id: string,
    status: 'accepted',
    friend: FriendPlayer
  }
}
```

The `friend` field contains the player who accepted the request.

## Friend Request Rejected

Sent to the original requester when the recipient rejects a pending friend
request.

The backend sends this event only when a pending request is deleted by the
recipient. Deleting an already accepted friendship does not send a rejected
request event.

### Published Topic

```text
/player/{requesterId}/friendship/friend_request/rejected/update
```

### Payload Shape

```ts
{
  topic: 'friendship',
  type: 'FRIEND_REQUEST_REJECTED',
  payload: {
    topic: `/player/${requesterId}/friendship/friend_request/rejected/update`,
    friendship_id: string,
    status: 'rejected',
    friend: FriendPlayer
  }
}
```

The `friend` field contains the player who rejected the request.

## Frontend Handling

Recommended frontend flow:

1. Subscribe to `/player/{playerId}/friendship/friend_request/+/+`.
2. Use the top-level `type` field to route the lifecycle event.
3. Use `FRIEND_REQUEST_CREATED` to add or refresh incoming requests.
4. Use `FRIEND_REQUEST_ACCEPTED` to move an outgoing request into the friend
   list.
5. Use `FRIEND_REQUEST_REJECTED` to remove or mark the outgoing request as
   rejected.
