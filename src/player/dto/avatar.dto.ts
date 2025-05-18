import { Expose } from 'class-transformer';

export class AvatarDto {
  /**
   * Head variant identifier
   *
   * @example 1
   */
  @Expose()
  head: number;

  /**
   * Hairstyle identifier
   *
   * @example 2
   */
  @Expose()
  hair: number;

  /**
   * Eye style identifier
   *
   * @example 3
   */
  @Expose()
  eyes: number;

  /**
   * Nose style identifier
   *
   * @example 1
   */
  @Expose()
  nose: number;

  /**
   * Mouth style identifier
   *
   * @example 2
   */
  @Expose()
  mouth: number;

  /**
   * Eyebrows style identifier
   *
   * @example 1
   */
  @Expose()
  eyebrows: number;

  /**
   * Clothes identifier
   *
   * @example 4
   */
  @Expose()
  clothes: number;

  /**
   * Feet (footwear) identifier
   *
   * @example 1
   */
  @Expose()
  feet: number;

  /**
   * Hands (gloves, etc.) identifier
   *
   * @example 2
   */
  @Expose()
  hands: number;

  /**
   * Avatar skin color in HEX format
   *
   * @example "#FAD9B5"
   */
  @Expose()
  skinColor: string;
}
