import IDataBuilder from '../../../../test_utils/interface/IDataBuilder';
import { Stall } from '../../../../../clan/stall/stall.schema';

export default class StallBuilder implements IDataBuilder<Stall> {
  private readonly base: Stall = {
    adPoster: {
      border: 'defaultBorder',
      colour: 'defaultColour',
      mainFurniture: 'defaultFurniture',
    },
    maxSlots: 7,
  };

  setAdPoster(adPoster: Stall['adPoster']): this {
    this.base.adPoster = adPoster;
    return this;
  }
  setMaxSlots(maxSlots: number): this {
    this.base.maxSlots = maxSlots;
    return this;
  }

  build(): Stall {
    return { ...this.base };
  }
}
