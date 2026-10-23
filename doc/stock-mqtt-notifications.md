# Stock MQTT Notifications

The backend publishes clan stock furniture change notifications through MQTT
using the common topic format built by `NotificationSender`.

Stock notifications describe completed stock state changes. They are separate
from voting notifications: voting MQTT tells what was voted and the voting
lifecycle status, while stock MQTT is sent only after a furniture item has
actually been added to stock, returned to stock, or removed from the seller
clan's stall.

## Subscribe Topic

Frontend clients that need all stock furniture changes for one clan should
subscribe to:

```text
/clan/{clanId}/stock/item/+
```

The published topics are:

```text
/clan/{clanId}/stock/item/new
/clan/{clanId}/stock/item/update
```

Where:

- `{clanId}` is the clan whose stock or stall state changed.
- `new` is used when a furniture item is added to the clan stock.
- `update` is used when a furniture item no longer belongs to the clan stock or
  clan stall.

## Payload

All stock notifications use the common MQTT envelope:

```ts
{
  topic: 'stock',
  type: 'STOCK_ITEM_ADDED' | 'STOCK_ITEM_REMOVED',
  payload: StockNotificationPayload
}
```

The inner `payload.topic` identifies the logical stock item event for the
frontend. It is not the MQTT broker topic.

```ts
type StockNotificationPayload = {
  topic: `/clan/${clanId}/stock/item/${event}`,
  clan_id: string,
  stock_id?: string,
  item: {
    _id: string,
    name: string,
    unityKey: string,
    isFurniture: true,
    furnitureSize: number[],
    price?: number
  },
  source:
    | 'clan_shop_direct'
    | 'clan_shop_vote'
    | 'flea_market_direct'
    | 'flea_market_vote'
    | 'flea_market_move'
    | 'flea_market_sell_rejected',
  sellerClan_id?: string,
  buyerClan_id?: string,
  fleaMarketItem_id?: string,
  ts: number
}
```

Only furniture items produce stock MQTT notifications. Non-furniture items are
ignored even if they move through the same service code.

## Stock Item Added

Sent after a furniture item has been successfully committed to a clan stock.

### Published Topic

```text
/clan/{clanId}/stock/item/new
```

### Event Type

```text
STOCK_ITEM_ADDED
```

### Sent When

- A clan shop item is bought directly and added to stock.
- A clan shop buy voting passes and the item is added to stock.
- A flea market or clan stall item is bought directly and added to the buyer
  clan stock.
- A flea market or clan stall buy voting passes and the item is added to the
  buyer clan stock.
- A flea market item is moved to stock.
- A flea market sell voting is rejected and the item is returned to stock.

## Stock Item Removed

Sent after a furniture item no longer belongs to the seller clan's stall because
another clan bought it.

### Published Topic

```text
/clan/{clanId}/stock/item/update
```

### Event Type

```text
STOCK_ITEM_REMOVED
```

### Sent When

- A flea market or clan stall item is bought directly by another clan.
- A flea market or clan stall buy voting passes and the item is transferred to
  another clan.

No remove notification is sent if the buyer clan and seller clan are the same.

## Voting Relationship

Voting notifications remain the source for voting lifecycle UI:

```text
/clan/{clanId}/voting/+/+
```

Stock notifications are not sent when a vote merely changes status. They are
sent from the service methods that perform the actual item transfer after the
database transaction has been committed.

Examples:

- `SHOP_BUY_ITEM` voting passes: voting MQTT reports the voting result; stock
  MQTT sends `STOCK_ITEM_ADDED` only after the item is created in stock.
- `FLEA_MARKET_BUY_ITEM` voting passes: voting MQTT reports the voting result;
  stock MQTT sends `STOCK_ITEM_ADDED` to the buyer clan and
  `STOCK_ITEM_REMOVED` to the seller clan after the transfer is committed.
- A buy voting is rejected: no stock MQTT is sent because stock ownership did
  not change.

## Frontend Handling

Recommended frontend flow:

1. Subscribe to `/clan/{clanId}/stock/item/+` when showing stock, stall, or clan
   inventory views.
2. Use top-level `type` to distinguish added and removed events.
3. Use `payload.item._id` for stock items and `payload.fleaMarketItem_id` when
   reconciling a removed stall item.
4. Refresh or patch the local stock/stall cache after receiving the message.
5. Treat voting MQTT and stock MQTT as separate events; do not infer a stock
   change from a voting message alone.
