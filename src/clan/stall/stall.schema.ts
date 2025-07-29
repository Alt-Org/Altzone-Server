import { Prop, Schema } from "@nestjs/mongoose";

export class AdPoster {
  @Prop({ type: String, required: true })
  border: string;

  @Prop({ type: String, required: true })
  colour: string;

  @Prop({ type: String, required: true })
  mainFurniture: string;
}

@Schema()
export class Stall {
  @Prop({ type: AdPoster, required: true })
  adPoster: AdPoster;

  @Prop({ type: Number, default: 7 })
  maxSlots: number;
}