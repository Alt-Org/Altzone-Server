import { Expose } from 'class-transformer';

export class EmotionDto {
  @Expose()
  emotion: string;

  @Expose()
  date: Date;
}