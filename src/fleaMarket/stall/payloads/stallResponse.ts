import { Expose } from 'class-transformer';
import AddType from '../../../common/base/decorator/AddType.decorator';

/**
 * Represents the advertisement poster for a stall
 */
@AddType('AdPoster')
export class AdPoster {
  /**
   * Border style of the stall's advertisement poster
   */
  @Expose()
  border?: string;

  /**
   * Colour of the stall's advertisement poster
   */
  @Expose()
  colour?: string;

  /**
   * Main furniture used as the focal point of the stall's poster
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
   */
  @Expose()
  adPoster?: AdPoster;

  /**
   * Maximum number of item slots in this stall
   */
  @Expose()
  maxSlots?: number;
}
