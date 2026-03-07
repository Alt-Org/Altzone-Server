import { IsHexColor, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AvatarPieceDto } from './avatar.dto';

/**
 * Data Transfer Object for partially updating an avatar's configuration.
 * All fields are optional to allow for specific component updates.
 */
export class ModifyAvatarDto {
  /**
   * Optional update for the avatar's head shape.
   * @type {AvatarPieceDto}
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  head?: AvatarPieceDto;

  /**
   * Optional update for the avatar's hair style or color.
   * @type {AvatarPieceDto}
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  hair?: AvatarPieceDto;

  /**
   * Optional update for the avatar's eyes.
   * @type {AvatarPieceDto}
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  eyes?: AvatarPieceDto;

  /**
   * Optional update for the avatar's nose.
   * @type {AvatarPieceDto}
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  nose?: AvatarPieceDto;

  /**
   * Optional update for the avatar's mouth.
   * @type {AvatarPieceDto}
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  mouth?: AvatarPieceDto;

  /**
   * Optional update for the avatar's eyebrows.
   * @type {AvatarPieceDto}
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  eyebrows?: AvatarPieceDto;

  /**
   * Optional update for the avatar's clothing.
   * @type {AvatarPieceDto}
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  clothes?: AvatarPieceDto;

  /**
   * Optional update for the avatar's footwear.
   * @type {AvatarPieceDto}
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  feet?: AvatarPieceDto;

  /**
   * Optional update for the avatar's hand or glove configuration.
   * @type {AvatarPieceDto}
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  hands?: AvatarPieceDto;

  /**
   * The primary skin tone of the avatar represented as a hex color string.
   * @example "#FAD9B5"
   */
  @IsOptional()
  @IsHexColor()
  skinColor?: string;
}
