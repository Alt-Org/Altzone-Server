# Jukebox MQTT Notifications

The backend publishes Jukebox state and playback lifecycle notifications through MQTT using the common topic format built by `NotificationSender`.

## Subscribe Topics

Frontend clients that need to listen to Jukebox updates for a clan should subscribe to:

```text
/clan/{clanId}/jukebox/+/update
```

The published topics are:

- **Song Update Topic**:
  ```text
  /clan/{clanId}/jukebox/song/update
  ```
- **Playlist Update Topic**:
  ```text
  /clan/{clanId}/jukebox/playlist/update
  ```

Where:
- `{clanId}` is the unique ID of the player's clan.

---

## 1. Song Update Notification

This notification is sent whenever a new song starts playing. It allows clients to synchronize their local audio player's start time and song ID.

### Publish Triggers
- When a player adds a song to an empty Jukebox, it starts playing immediately.
- When the current song finishes playing and the next song is pulled from the queue.

### Payload Shape

```ts
{
  topic: `/clan/${clanId}/jukebox/song/update`,
  song: {
    songId: string,    // Client-side identifier for the song
    startedAt: number  // UNIX timestamp in milliseconds representing when the song started playing
  }
}
```

---

## 2. Playlist Update Notification

This notification is sent whenever there is a change to the Jukebox playlist state (the current song, the queue, or both).

### Publish Triggers
- When a player adds a new song (it is either appended to the queue or becomes the current song).
- When a song starts playing (updating the queue and the current playing song).
- When a player removes a song they added from the queue.
- When the last song finishes playing, clearing the playlist.

### Payload Shape

```ts
{
  topic: `/clan/${clanId}/jukebox/playlist/update`,
  playlist: {
    clanId: string,
    currentSong: {
      id: string,                  // Database/Queue entry unique identifier
      songId: string,              // Client-side song identifier
      songDurationSeconds: number, // Duration of the song
      playerId: string,            // ID of the player who added this song
      startedAt: number            // UNIX timestamp in milliseconds
    } | null,
    songQueue: [
      {
        id: string,                  // Database/Queue entry unique identifier
        songId: string,              // Client-side song identifier
        songDurationSeconds: number, // Duration of the song
        playerId: string             // ID of the player who added this song
      }
    ]
  }
}
```

---

## Jukebox Lifecycle & System Operations

### Add Song
- **Endpoint**: `POST /jukebox`
- **Logic**:
  1. Checks if the player has reached the maximum allowed limit of songs in the queue (dependent on the clan size: e.g., smaller limit for larger clans).
  2. If `currentSong` is empty:
     - Sets the song as the `currentSong` with `startedAt` set to `Date.now()`.
     - Publishes a **Song Update** to `/clan/{clanId}/jukebox/song/update`.
     - Schedules a timeout/job to start the next song when the current song's duration expires.
  3. If a song is already playing:
     - Appends the song to `songQueue`.
  4. Publishes a **Playlist Update** to `/clan/{clanId}/jukebox/playlist/update`.

### Next Song Auto-Play
- **Logic** (via internal timeouts / bullmq job processor):
  1. Removes the first song from `songQueue` (shifts the array).
  2. If a next song exists:
     - Sets it as the `currentSong` with `startedAt = Date.now()`.
     - Publishes a **Song Update** to `/clan/{clanId}/jukebox/song/update`.
     - Publishes a **Playlist Update** to `/clan/{clanId}/jukebox/playlist/update`.
     - Schedules a timeout for the duration of the new song.
  3. If `songQueue` is empty (Jukebox playlist complete):
     - Clears the internal clan jukebox state.
     - Publishes a **Playlist Update** with `currentSong = null` and `songQueue = []` to clear client player UI.

### Remove Song
- **Endpoint**: `DELETE /jukebox/:_id`
- **Logic**:
  1. Filters out the specified song from the `songQueue` if it matches the requesting player's `playerId`.
  2. Publishes a **Playlist Update** to `/clan/{clanId}/jukebox/playlist/update`.

---

## Recommended Frontend Handling

1. **Subscription**:
   Subscribe to `/clan/{clanId}/jukebox/+/update` on application load or when entering the clan lobby.

2. **Playback Synchronization**:
   - When receiving a message on `/clan/{clanId}/jukebox/song/update`:
     - Synchronize the audio player with `songId`.
     - Calculate the playback offset: `const offsetSeconds = (Date.now() - payload.song.startedAt) / 1000;`
     - Seek/start the playback at `offsetSeconds`.

3. **Queue & UI Updates**:
   - When receiving a message on `/clan/{clanId}/jukebox/playlist/update`:
     - Update the Jukebox panel or modal list with `payload.playlist.songQueue`.
     - Update the current song metadata.
     - If `payload.playlist.currentSong` is `null`, hide the Jukebox player or show an idle state.
