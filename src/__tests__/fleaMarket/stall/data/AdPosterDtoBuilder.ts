import IDataBuilder from "../../../test_utils/interface/IDataBuilder";
import { AdPosterDto } from "../../../../fleaMarket/stall/dto/adPoster.dto";

export default class AdPosterDtoBuilder implements IDataBuilder<AdPosterDto> {
  private readonly base: AdPosterDto = {
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

  build(): AdPosterDto {
    return { ...this.base };
  }
}
