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

export class AvatarDto {
  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  head: AvatarPieceDto;

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  hair: AvatarPieceDto;

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  eyes: AvatarPieceDto;

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  nose: AvatarPieceDto;

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  mouth: AvatarPieceDto;

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  eyebrows: AvatarPieceDto;

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  clothes: AvatarPieceDto;

  @Expose()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  feet: AvatarPieceDto;

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
