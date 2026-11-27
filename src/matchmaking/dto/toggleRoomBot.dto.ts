import { IsInt, Max, Min } from 'class-validator';

export class ToggleRoomBotDto {
  /** Zero-based CUSTOM room slot where the bot is added or removed. */
  @IsInt()
  @Min(0)
  @Max(3)
  position: number;
}
