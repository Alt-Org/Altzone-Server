/**
 * DTO for AdPoster embedded document in Stall
 */
export class AdPosterDto {
  /** Border style of the stall's advertisement poster */
  border: string;

  /** Colour of the stall's advertisement poster */
  colour: string;

  /** Main furniture used as the focal point of the stall's poster */
  mainFurniture: string;
}

/**
 * DTO for Stall document
 */
export class StallDto {
  /** Stall's advertisement poster */
  adPoster: AdPosterDto;

  /** Maximum number of item slots in this stall */
  maxSlots: number;
}