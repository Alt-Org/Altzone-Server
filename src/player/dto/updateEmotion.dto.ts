import { IsEnum, IsNotEmpty } from 'class-validator';
import { PlayerEmotion } from '../enum/playerEmotion.enum';

export class UpdateEmotionDto {
  @IsEnum(PlayerEmotion, {
    message:
      'Emotion must be one of these: Sorrow, Anger, Joy, Playful, Love, Blank',
  })
  @IsNotEmpty()
  emotion: PlayerEmotion;
}
