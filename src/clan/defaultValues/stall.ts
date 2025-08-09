import { Stall } from '../stall/stall.schema';

/**
 * Function where to define stall related default values
 */
export function getStallDefaultValues() {
  return {
    stallSlotPrice: 200,
  };
}

/**
 * Get default stall to be saved in DB
 *
 * @returns default stall
 */
export function getDefaultStall(): Stall {
  return {
    adPoster: {
      border: '#000000',
      colour: '#FFFFFF',
      mainFurniture: '',
    },
    maxSlots: 10,
  };
}
