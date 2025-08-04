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
}
