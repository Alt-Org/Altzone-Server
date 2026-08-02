# Voting MQTT Notifications

The backend publishes voting lifecycle notifications through MQTT with the
common notification topic format built by `NotificationSender`.

## Subscribe Topic

Frontend clients that need all voting updates for one clan should subscribe to:

```text
/clan/{clanId}/voting/+/+
```

The published topic is:

```text
/clan/{clanId}/voting/{votingType}/{status}
```

Where:

- `{clanId}` is `voting.organizer.clan_id`
- `{votingType}` is one value from `VotingType`
- `{status}` is one of `new`, `update`, `end`

Current voting types:

- `flea_market_sell_item`
- `flea_market_buy_item`
- `change_item_price`
- `shop_buy_item`
- `set_clan_role`
- `clan_governance_update`

## Payload

All voting notifications use this payload shape:

```ts
{
  topic: `/clan/${clanId}/voting/${votingId}`,
  status: 'new' | 'update' | 'end',
  voting_id: string,
  type: VotingType,
  entity: unknown,
  organizer?: PlayerDto,
  voter?: PlayerDto,
  votes?: Vote[],
  endedAt?: Date
}
```

`payload.topic` is a voting-instance identifier for the frontend. It is not the
MQTT broker topic. The MQTT broker topic remains
`/clan/{clanId}/voting/{votingType}/{status}`.

## Status Semantics

- `new`: a voting was created. Payload includes `organizer`.
- `update`: a new vote was added. Payload includes `voter`.
- `end`: a voting was finalized. It is sent once per voting.

## Entity Shapes

`entity` depends on `type`:

```ts
// flea_market_sell_item, flea_market_buy_item
FleaMarketItemDto | { fleaMarketItem_id: string }

// change_item_price
{
  fleaMarketItem: FleaMarketItemDto | { fleaMarketItem_id: string },
  price: number
}

// shop_buy_item
{
  shopItemName: ItemName
}

// set_clan_role
{
  player_id: string,
  role_id: string
}

// clan_governance_update
{
  roles?: CreateClanRoleDto[],
  admin_idsToAdd?: string[],
  admin_idsToDelete?: string[]
}
```

## Frontend Handling

Recommended frontend flow:

1. Subscribe to `/clan/{clanId}/voting/+/+`.
2. Use `payload.status` to route lifecycle behavior.
3. Use `payload.voting_id` as the stable voting id.
4. Use `payload.type` to narrow `payload.entity`.
5. Treat `payload.topic` as the voting-instance channel/id:
   `/clan/{clanId}/voting/{votingId}`.
