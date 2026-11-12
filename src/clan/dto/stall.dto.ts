export class ClanAdPosterTextFieldDto {
  /** Actual text in ad text section */
  textString: string;

  /** Font used */
  textFont: string;

  /** Colour used in ad text */
  textColour: string;

  /** Text position in the ad */
  textPosition: number[];
}

/**
 * DTO for AdPoster embedded document in Stall
 */
export class ClanAdPosterDto {
  /** Border style of the stall's advertisement poster */
  border: string;

  /** Colour of the stall's advertisement poster */
  colour: string;

  /** Main furniture used as the focal point of the stall's poster */
  mainFurniture: string;

  /** Text field settings of the stall's advertisement poster */
  textField: ClanAdPosterTextFieldDto;
}

/**
 * DTO for Stall document
 */
export class StallDto {
  /** Stall's advertisement poster */
  adPoster: ClanAdPosterDto;

  /** Maximum number of item slots in this stall */
  maxSlots: number;
}
