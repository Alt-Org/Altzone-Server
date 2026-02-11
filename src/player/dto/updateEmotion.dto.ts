import { IsEnum } from 'class-validator';
import { PlayerEmotion } from '../../common/enum/playerEmotion.enum';

export class UpdateEmotionDto {
  @IsEnum(PlayerEmotion, {
    message: 'Emotion must be one of these: Sorrow, Anger, Joy, Playful, Love, Blank',
  })
  emotion: PlayerEmotion;
}