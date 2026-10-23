import { ItemName } from '../../item/enum/itemName.enum';

export type StockNotificationSource =
  | 'clan_shop_direct'
  | 'clan_shop_vote'
  | 'flea_market_direct'
  | 'flea_market_vote'
  | 'flea_market_move'
  | 'flea_market_sell_rejected';

export type StockNotificationItemPayload = {
  _id: string;
  name: ItemName;
  unityKey: string;
  isFurniture: boolean;
  furnitureSize: number[];
  price?: number;
};

export type StockNotificationPayload = {
  topic: string;
  clan_id: string;
  stock_id?: string;
  item: StockNotificationItemPayload;
  source: StockNotificationSource;
  sellerClan_id?: string;
  buyerClan_id?: string;
  fleaMarketItem_id?: string;
  ts: number;
};
