import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { FleaMarketAdPosterDto } from '../../../../fleaMarket/stall/dto/adPoster.dto';

export default class AdPosterDtoBuilder implements IDataBuilder<FleaMarketAdPosterDto> {
  private readonly base: FleaMarketAdPosterDto = {
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

  build(): FleaMarketAdPosterDto {
    return { ...this.base };
  }
}
