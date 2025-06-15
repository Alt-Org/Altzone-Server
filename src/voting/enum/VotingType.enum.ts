/**
 * Enum representing the types of voting in the voting schema.
 *
 * This enum is used to specify the type of voting action being performed,
 * such as voting for selling an item or buying an item.
 */
export enum VotingType {
  FLEA_MARKET_SELL_ITEM = 'flea_market_sell_item',
  FLEA_MARKET_BUY_ITEM = 'flea_market_buy_item',
  SHOP_BUY_ITEM = 'shop_buy_item',
  SET_CLAN_ROLE = 'set_clan_role',
}
