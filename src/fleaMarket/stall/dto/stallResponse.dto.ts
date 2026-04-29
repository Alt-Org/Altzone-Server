import { Expose } from 'class-transformer';
import AddType from '../../../common/base/decorator/AddType.decorator';

/**
 * Represents the advertisement poster for a stall
 */
@AddType('AdPoster')
class AdPoster {
  /**
   * Border style of the stall's advertisement poster
   * @example "border1"
   */
  @Expose()
  border?: string;

  /**
   * Colour of the stall's advertisement poster
   * @example "red"
   */
  @Expose()
  colour?: string;

  /**
   * Main furniture used as the focal point of the stall's poster
   * @example "table"
   */
  @Expose()
  mainFurniture?: string;
}

/**
 * Represents a Clan's stall in the flea market
 */
@AddType('StallResponse')
export class StallResponse {
  /**
   * Stall's advertisement poster
   * @example { border: "border1", colour: "red", mainFurniture: "table" }
   */
  @Expose()
  adPoster?: AdPoster;

  /**
   * Maximum number of item slots in this stall
   * @example 10
   */
  @Expose()
  maxSlots?: number;

  /**
   * ID of the stall's furniture items
   * The ID is indirectly related to the stall the furniture item is in
   * @example "507f1f77bcf86cd799440011"
   */
  @Expose()
  _id?: string;
  
  /**
   * Furniture items that are currently in the stall
   * @example ["chair", "lamp"]
   */
  @Expose()
  furnitureItems?: string[];
}
