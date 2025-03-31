import { IsInt, IsString } from 'class-validator';

export class ModifyAvatarDto {
  @IsInt()
  head: number;

  @IsInt()
  hair: number;

  @IsInt()
  eyes: number;

  @IsInt()
  nose: number;

  @IsInt()
  mouth: number;

  @IsInt()
  eyebrows: number;

  @IsInt()
  clothes: number;

  @IsInt()
  feet: number;

  @IsInt()
  hands: number;

  @IsString()
  skinColor: string;
}
