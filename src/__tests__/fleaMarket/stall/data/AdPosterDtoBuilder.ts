import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { FleaMarketAdPosterDto } from '../../../../fleaMarket/stall/dto/adPoster.dto';

export default class AdPosterDtoBuilder
  implements IDataBuilder<FleaMarketAdPosterDto>
{
  private readonly base: FleaMarketAdPosterDto = {
    border: 'defaultBorder',
    colour: 'defaultColour',
    mainFurniture: 'defaultFurniture',
    textField: {
      textString: 'defaultAdTitle',
      textFont: 'defaultFont',
      textColour: 'defaultColour',
      textPosition: [0, 0, 0, 0],
    },
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
  setTextString(textString: string): this {
    this.base.textField.textString = textString;
    return this;
  }
  setTextFont(textFont: string): this {
    this.base.textField.textFont = textFont;
    return this;
  }
  setTextColour(textColour: string): this {
    this.base.textField.textColour = textColour;
    return this;
  }
  setTextPosition(textPosition: number[]): this {
    this.base.textField.textPosition = textPosition;
    return this;
  }

  build(): FleaMarketAdPosterDto {
    return { ...this.base, textField: { ...this.base.textField } };
  }
}
