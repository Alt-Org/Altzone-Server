import { itemProperties } from '../../clanInventory/item/const/itemProperties';

/**
 * Temporary hard-coded prize pool
 */
export const prizePool = {
  maxPoints: 2000,
  milestones: [
    { points: 300, rewards: { coins: 30, item: itemProperties.Sofa_Taakka } },
    { points: 600, rewards: { coins: 60, item: itemProperties.Sofa_Rakkaus } },
    {
      points: 1200,
      rewards: { coins: 120, item: itemProperties.Sofa_Muistoja },
    },
    { points: 2000, rewards: { coins: 200, item: itemProperties.Sofa_Kipu } },
  ],
  finalRewards: [
    { id: 1, reward: 'Reward 1' },
    { id: 2, reward: 'Reward 2' },
    { id: 3, reward: 'Reward 3' },
  ],
};
