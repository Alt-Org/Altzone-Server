import { Expose } from 'class-transformer';

export class AvatarDto {
  @Expose()
  head: number;

  @Expose()
  hair: number;

  @Expose()
  eyes: number;

  @Expose()
  nose: number;

  @Expose()
  mouth: number;

  @Expose()
  eyebrows: number;

  @Expose()
  clothes: number;

  @Expose()
  feet: number;

  @Expose()
  hands: number;

  @Expose()
  skinColor: string;
}
