/**
 * Lifecycle status of a furniture item.
 *
 * - IN_STOCK: Item is in the clan's stock, not currently for sale.
 *   (Regular Items have this status conceptually but the field may not be persisted.)
 * - AVAILABLE: Item has been approved for selling via a vote, but not yet
 *   placed onto a stall. Lives in the FleaMarketItem collection.
 * - SHIPPING: Item is on the clan's stall, waiting to be bought by another
 *   clan. Lives in the FleaMarketItem collection.
 * - BOOKED: Another clan has reserved the item and is in the process of
 *   voting whether to buy it. Lives in the FleaMarketItem collection.
 */
export enum Status {
  IN_STOCK = 'in_stock',
  AVAILABLE = 'available',
  SHIPPING = 'shipping',
  BOOKED = 'booked',
}
