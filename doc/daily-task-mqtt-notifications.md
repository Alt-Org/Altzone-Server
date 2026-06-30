# Daily Task MQTT Notifications

The backend publishes Daily Task progress and completion notifications through MQTT using the common topic format built by `NotificationSender`.

## Subscribe Topics

Frontend clients can subscribe to player-specific task updates and/or clan-wide task updates.

### 1. Player-Specific Task Updates
To listen to all task events for a specific player:
```text
/player/{playerId}/daily_task/+/+
```
Or for a specific task type:
```text
/player/{playerId}/daily_task/{taskType}/+
```

### 2. Clan-Wide Task Updates
To listen to all clan-wide task updates (completion events and milestones):
```text
/clan/{clanId}/daily_task/+/+
```

---

## Topic Parameters
- `{playerId}`: The unique database ID of the player.
- `{clanId}`: The unique database ID of the clan.
- `{taskType}`: The type of task being updated. This is a string enum value from [ServerTaskName](file:///c:/Users/marju/backend-prg/Altzone-Server/src/dailyTasks/enum/serverTaskName.enum.ts) or [UITaskName](file:///c:/Users/marju/backend-prg/Altzone-Server/src/dailyTasks/enum/uiTaskName.enum.ts).
- `{status}`: The lifecycle status: `new`, `update`, `error`, or `end`.

---

## 1. Task Received / Reserved Notification
Sent when a player successfully reserves a new daily task from the clan's available tasks.

### Topic:
```text
/player/{playerId}/daily_task/{taskType}/new
```

### Publish Triggers
- When a player calls `reserveTask` (assigning a task to themselves).

### Payload Shape
```json
{
  "_id": "665af23e5e982f0013aa334b",
  "clan_id": "665af23e5e982f0013aa1122",
  "player_id": "665af23e5e982f0013aa4455",
  "title": { "fi": "Kirjoita klaanichattiin viesti" },
  "type": "write_chat_message_clan",
  "points": 50,
  "coins": 100,
  "startedAt": "2026-06-08T07:44:24.000Z",
  "amount": 1,
  "amountLeft": 1,
  "timeLimitMinutes": 2
}
```

---

## 2. Task Updated Notification
Sent when a player progresses in their reserved task (e.g. increments progress but does not finish it yet).

### Topic:
```text
/player/{playerId}/daily_task/{taskType}/update
```

### Publish Triggers
- When an action triggers progress on the player's active task, reducing `amountLeft` but keeping it greater than `0`.

### Payload Shape
Same as the `new` status payload, with the updated `amountLeft` value.

---

## 3. Task Error Notification
Sent when an error occurs during task execution or validation.

### Topic:
```text
/player/{playerId}/daily_task/{taskType}/error
```

### Publish Triggers
- If a task error or exception occurs (e.g., during task processing).

### Payload Shape
```json
{
  "name": "APIError",
  "reason": "Unexpected error",
  "statusCode": 500,
  "message": "Error description",
  "field": null,
  "value": null,
  "additional": null
}
```

---

## 4. Task Completed Notification (Player)
Sent to the player when their task is fully completed (`amountLeft` reaches `0`).

### Topic:
```text
/player/{playerId}/daily_task/{taskType}/end
```

### Publish Triggers
- When `amountLeft` reaches `0`.

### Payload Shape
Same as the task payload, with `amountLeft: 0`.

---

## 5. Task Completed Notification (Clan)
Sent to the clan to broadcast that a member has completed a daily task.

### Topic:
```text
/clan/{clanId}/daily_task/{taskType}/end
```

### Publish Triggers
- When any clan member successfully completes an active task.

### Payload Shape
```ts
{
  "task": {
    "_id": "665af23e5e982f0013aa334b",
    "clan_id": "665af23e5e982f0013aa1122",
    "player_id": "665af23e5e982f0013aa4455",
    "title": { "fi": "Kirjoita klaanichattiin viesti" },
    "type": "write_chat_message_clan",
    "points": 50,
    "coins": 100,
    "startedAt": "2026-06-08T07:44:24.000Z",
    "amount": 1,
    "amountLeft": 0,
    "timeLimitMinutes": 2
  },
  "completedByPlayerId": "665af23e5e982f0013aa4455"
}
```

---

## 6. Clan Milestone Reached Notification
Sent to the clan when progression milestones are unlocked as a result of completing a daily task.

### Topic:
```text
/clan/{clanId}/daily_task/milestone/update
```

### Publish Triggers
- When a completed task rewards enough clan points/coins to trigger new milestones in clan progression.

### Payload Shape
```ts
{
  "task": {
    "_id": "665af23e5e982f0013aa334b",
    "clan_id": "665af23e5e982f0013aa1122",
    "player_id": "665af23e5e982f0013aa4455",
    "title": { "fi": "Kirjoita klaanichattiin viesti" },
    "type": "write_chat_message_clan",
    "points": 50,
    "coins": 100,
    "startedAt": "2026-06-08T07:44:24.000Z",
    "amount": 1,
    "amountLeft": 0,
    "timeLimitMinutes": 2
  },
  "completedByPlayerId": "665af23e5e982f0013aa4455",
  "reachedMilestones": [1, 2] // List of milestones reached
}
```

---

## Daily Task Lifecycle & System Operations

### 1. Task Reservation
- **Trigger**: A player reserves a task (handled by `reserveTask` in `DailyTasksService`).
- **Backend Flow**:
  1. The server verifies if the task is already reserved.
  2. If the player has another active reserved task, it is unreserved first (unsetting its `player_id`).
  3. The task's `player_id` is set to the current player, and `startedAt` is set to the current timestamp.
  4. The task is queued in `DailyTaskQueue` (for auto-expiry handling).
  5. The server publishes a **Task Received** notification to `/player/{playerId}/daily_task/{taskType}/new`.

### 2. Task Expiry / Unreservation
- **Trigger**: The queue timeout expires or a player unreserves the task.
- **Backend Flow**:
  1. The server unsets `player_id` and `startedAt` in the database.
  2. No MQTT notification is published (clients can query state if needed).

### 3. Task Progress / Completion
- **Trigger**: Game events emitted via `@OnEvent('newDailyTaskEvent')` (e.g., chat messages, battle results, or client-reported UI tasks).
- **Backend Flow**:
  1. The service decrements the `amountLeft` of the player's active task.
  2. **If progress is made (`amountLeft > 0`)**:
     - The server publishes a **Task Updated** notification to `/player/{playerId}/daily_task/{taskType}/update`.
  3. **If the task is completed (`amountLeft <= 0`)**:
     - The task is reset in the clan's pool with new random task values via `deleteTask`.
     - The player and clan are rewarded points and coins.
     - The server publishes a **Task Completed (Player)** notification to `/player/{playerId}/daily_task/{taskType}/end`.
     - The server publishes a **Task Completed (Clan)** notification to `/clan/{clanId}/daily_task/{taskType}/end`.
     - If the clan points unlock one or more milestones:
       - The server publishes a **Clan Milestone Reached** notification to `/clan/{clanId}/daily_task/milestone/update`.

---

## Recommended Frontend Handling

1. **Subscriptions**:
   - Subscribe to `/player/{playerId}/daily_task/+/+` on player profile/app initialization.
   - Subscribe to `/clan/{clanId}/daily_task/+/+` upon entering the clan lobby or relevant dashboard.

2. **Personal HUD & Notifications**:
   - On `/new`, add the task to the player's active daily task slot.
   - On `/update`, animate the task's progress bar in the UI.
   - On `/end`, trigger a completion celebration/reward overlay and clear the active task slot.

3. **Clan Activity Feed**:
   - On `/clan/{clanId}/daily_task/{taskType}/end`, display a notification in the clan feed (e.g., "User X completed a task!").
   - On `/clan/{clanId}/daily_task/milestone/update`, update the clan progression progress bar and show milestone-unlocked popups.
