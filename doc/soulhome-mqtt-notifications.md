# Soulhome MQTT Notifications

The backend publishes clan Soul Home room state and layout notifications through
MQTT using the common topic format built by `NotificationSender`.

Soulhome notifications describe committed room changes. Layout notifications
are sent only after `PUT /room` has successfully saved the room and furniture
changes.

## Subscribe Topic

Frontend clients that need Soul Home room changes for one clan should subscribe
to:

```text
/clan/{clanId}/soulhome/+/update
```

The published topic is:

```text
/clan/{clanId}/soulhome/{soulHomeId}/update
```

Where:

- `{clanId}` is the clan whose Soul Home changed.
- `{soulHomeId}` is the Soul Home containing the changed room or rooms.

## Payload

All Soulhome notifications use the common MQTT envelope:

```ts
{
  topic: 'soulhome',
  type:
    | 'SOULHOME_ROOM_ACTIVATED'
    | 'SOULHOME_ROOM_DEACTIVATED'
    | 'SOULHOME_ROOM_LAYOUT_UPDATED',
  payload: SoulHomeRoomNotificationPayload
}
```

The inner `payload.topic` identifies the logical Soul Home room event for the
frontend. It is not the MQTT broker topic.

```ts
type SoulHomeRoomNotificationPayload = {
  topic: `/clan/${clanId}/soulhome/${soulHomeId}/update`,
  clan_id: string,
  soulHome_id: string,
  mode?: 'single' | 'batch',
  rooms: Array<{
    _id: string,
    roomPosition?: number,
    roomStatus?: 'Active' | 'Inactive',
    deactivationTime?: string | null,
    roomColour?: string,
    wallpaper?: string,
    floorType?: string,
    furnitureChanged?: boolean
  }>,
  ts: number
}
```

## Room Activated

Sent after one or more rooms have been activated.

### Published Topic

```text
/clan/{clanId}/soulhome/{soulHomeId}/update
```

### Event Type

```text
SOULHOME_ROOM_ACTIVATED
```

### Payload Shape

```ts
{
  topic: 'soulhome',
  type: 'SOULHOME_ROOM_ACTIVATED',
  payload: {
    topic: `/clan/${clanId}/soulhome/${soulHomeId}/update`,
    clan_id: string,
    soulHome_id: string,
    rooms: [
      {
        _id: string,
        roomPosition?: number,
        roomStatus: 'Active',
        deactivationTime: string
      }
    ],
    ts: number
  }
}
```

## Room Deactivated

Sent after a room has been deactivated.

### Published Topic

```text
/clan/{clanId}/soulhome/{soulHomeId}/update
```

### Event Type

```text
SOULHOME_ROOM_DEACTIVATED
```

### Payload Shape

```ts
{
  topic: 'soulhome',
  type: 'SOULHOME_ROOM_DEACTIVATED',
  payload: {
    topic: `/clan/${clanId}/soulhome/${soulHomeId}/update`,
    clan_id: string,
    soulHome_id: string,
    rooms: [
      {
        _id: string,
        roomPosition?: number,
        roomStatus: 'Inactive',
        deactivationTime: string
      }
    ],
    ts: number
  }
}
```

## Room Layout Updated

Sent after `PUT /room` has successfully saved room layout and furniture changes.

`PUT /room` accepts either one room object or an array of room objects:

```ts
UpdateRoomDto
```

```ts
UpdateRoomDto[]
```

Both request shapes publish the same event type. The `mode` field tells whether
the request updated one room or multiple rooms:

- `single` means the request body was one room object.
- `batch` means the request body was an array.

Only one MQTT message is published per successful `PUT /room` request. Batch
updates are not split into one message per room.

### Published Topic

```text
/clan/{clanId}/soulhome/{soulHomeId}/update
```

### Event Type

```text
SOULHOME_ROOM_LAYOUT_UPDATED
```

### Payload Shape

```ts
{
  topic: 'soulhome',
  type: 'SOULHOME_ROOM_LAYOUT_UPDATED',
  payload: {
    topic: `/clan/${clanId}/soulhome/${soulHomeId}/update`,
    clan_id: string,
    soulHome_id: string,
    mode: 'single' | 'batch',
    rooms: [
      {
        _id: string,
        roomColour?: string,
        wallpaper?: string,
        floorType?: string,
        furnitureChanged: boolean
      }
    ],
    ts: number
  }
}
```

## Frontend Handling

Recommended frontend flow:

1. Subscribe to `/clan/{clanId}/soulhome/+/update` when showing the Soul Home.
2. Use the top-level `type` field to route activation, deactivation, and layout
   events.
3. Use `payload.rooms` as an array for both single and batch updates.
4. Use `payload.mode` for layout updates if the UI needs to distinguish one-room
   saves from batch saves.
5. Refresh or patch the local Soul Home room cache after receiving the message.
