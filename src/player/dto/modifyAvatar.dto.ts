import { IsHexColor, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AvatarPieceDto } from './avatar.dto';

export class ModifyAvatarDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  head?: AvatarPieceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  hair?: AvatarPieceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  eyes?: AvatarPieceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  nose?: AvatarPieceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  mouth?: AvatarPieceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  eyebrows?: AvatarPieceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  clothes?: AvatarPieceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  feet?: AvatarPieceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarPieceDto)
  hands?: AvatarPieceDto;

  /**
   * Skin color as a hex string
   * @example "#FAD9B5"
   */
  @IsOptional()
  @IsHexColor()
  skinColor?: string;
}
