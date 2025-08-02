import IDataBuilder from '../../../../test_utils/interface/IDataBuilder';
import { AdPoster } from '../../../../../clan/stall/stall.schema';

export default class AdPosterBuilder implements IDataBuilder<AdPoster> {
  private readonly base: AdPoster = {
    border: 'defaultBorder',
    colour: 'defaultColour',
    mainFurniture: 'defaultFurniture',
  };

  setBorder(border: string): this {
    this.base.border = border;
    return this;
  }
  setColour(colour: string): this {
    this.base.colour = colour;
    return this;
  }
  setMainFurniture(mainFurniture: string): this {
    this.base.mainFurniture = mainFurniture;
    return this;
  }

  build(): AdPoster {
    return { ...this.base };
  }
}
