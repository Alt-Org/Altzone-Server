import { IsString } from 'class-validator';

export class BoxNameDto {
  /**
   * Name of the box
   *
   * @example "Class 7A"
   */
  @IsString()
  boxName: string;
}
