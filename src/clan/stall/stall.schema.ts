import { Prop, Schema } from '@nestjs/mongoose';

export class AdPosterTextField {
  @Prop({ type: String, required: true })
  textString: string;

  @Prop({ type: String, required: true })
  textFont: string;

  @Prop({ type: String, required: true })
  textColour: string;

  @Prop({ type: [Number], required: true })
  textPosition: number[];
}

export class AdPoster {
  @Prop({ type: String, required: true })
  border: string;

  @Prop({ type: String, required: true })
  colour: string;

  @Prop({ type: String, required: true })
  mainFurniture: string;

  @Prop({ type: AdPosterTextField, required: true })
  textField: AdPosterTextField;
}

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Stall {
  @Prop({ type: AdPoster, required: true })
  adPoster: AdPoster;

  @Prop({ type: Number, default: 7 })
  maxSlots: number;
}
