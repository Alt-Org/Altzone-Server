import { PlayerEmotion } from "../enum/playerEmotion.enum";

export interface EmotionCheckResult {
  emotioncheck: {
    last_sent: {
      date: Date;
      emotion: PlayerEmotion;
    } | null;
    submitted_today: boolean;
  };
}