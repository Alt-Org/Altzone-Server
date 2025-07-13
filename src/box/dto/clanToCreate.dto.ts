import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ClanToCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isOpen?: boolean = true;
}
