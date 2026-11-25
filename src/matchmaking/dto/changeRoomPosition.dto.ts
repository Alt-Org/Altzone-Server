import { IsInt, Max, Min } from 'class-validator';

export class ChangeRoomPositionDto {
  /** Zero-based target slot in the CUSTOM room. */
  @IsInt()
  @Min(0)
  @Max(3)
  position: number;
}
