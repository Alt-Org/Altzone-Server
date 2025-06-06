import { IsInt, IsString } from 'class-validator';

export class ModifyAvatarDto {
  /**
   * Head variant ID
   *
   * @example 1
   */
  @IsInt()
  head: number;

  /**
   * Hair style ID
   *
   * @example 3
   */
  @IsInt()
  hair: number;

  /**
   * Eyes style ID
   *
   * @example 2
   */
  @IsInt()
  eyes: number;

  /**
   * Nose style ID
   *
   * @example 1
   */
  @IsInt()
  nose: number;

  /**
   * Mouth style ID
   *
   * @example 2
   */
  @IsInt()
  mouth: number;

  /**
   * Eyebrows style ID
   *
   * @example 1
   */
  @IsInt()
  eyebrows: number;

  /**
   * Clothes set ID
   *
   * @example 4
   */
  @IsInt()
  clothes: number;

  /**
   * Feet (footwear) ID
   *
   * @example 1
   */
  @IsInt()
  feet: number;

  /**
   * Hands (gloves/accessories) ID
   *
   * @example 2
   */
  @IsInt()
  hands: number;

  /**
   * Skin color as a hex string
   *
   * @example "#FAD9B5"
   */
  @IsString()
  skinColor: string;
}
