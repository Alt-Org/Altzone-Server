import { Expose, Type } from 'class-transformer';
import { IsNumber, IsHexColor, ValidateNested } from 'class-validator';

export class AvatarPieceDto {
  /**
   * Piece identifier
   * @example 1
   */
  @Expose()
  @IsNumber()
  id: number;

  /**
   * Piece color in HEX format
   * @example "#ff0000"
   */
  @Expose()
  @IsHexColor()
  color: string;
}

/**
 * Data Transfer Object for the complete Avatar configuration.
 * Groups various physical and clothing components together.
 */
export class AvatarDto {
  /**
   * Configuration for the avatar's head shape and base.
   * @example {AvatarPieceDto}
   */

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  head: AvatarPieceDto;

  /**
   * Configuration for the avatar's hairstyle and color.
   * @type {AvatarPieceDto}
   */

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  hair: AvatarPieceDto;

  /**
   * Configuration for the avatar's eye shape and iris color.
   * @type {AvatarPieceDto}
   */

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  eyes: AvatarPieceDto;

  /**
   * Configuration for the avatar's nose structure.
   * @type {AvatarPieceDto}
   */

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  nose: AvatarPieceDto;

  /**
   * Configuration for the avatar's mouth and lip shape.
   * @type {AvatarPieceDto}
   */

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  mouth: AvatarPieceDto;

  /**
   * Configuration for the avatar's eyebrow shape and thickness.
   * @type {AvatarPieceDto}
   */

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  eyebrows: AvatarPieceDto;

  /**
   * Configuration for the avatar's upper body clothing or outfit.
   * @type {AvatarPieceDto}
   */

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  clothes: AvatarPieceDto;

  /**
   * Configuration for the avatar's footwear.
   * @type {AvatarPieceDto}
   */

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  feet: AvatarPieceDto;

  /**
   * Configuration for the avatar's hand features or gloves.
   * @type {AvatarPieceDto}
   */

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  hands: AvatarPieceDto;

  /**
   * Avatar skin color in HEX format
   * @example "#FAD9B5"
   */
  @Expose()
  @IsHexColor()
  skinColor: string;
}
