import { PlayerEmotion } from '../enum/playerEmotion.enum';

export class EmotionCheckDto {
  constructor(isSent: boolean, currentEmotion: PlayerEmotion) {
    this.isSent = isSent;
    this.currentEmotion = currentEmotion;
  }

  isSent: boolean;
  currentEmotion: PlayerEmotion;
}