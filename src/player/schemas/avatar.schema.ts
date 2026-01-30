import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ _id: false })
export class AvatarPiece {
  @Prop({ type: Number, required: true })
  id: number;

  @Prop({ type: String, required: true })
  color: string;
}

const AvatarPieceSchema = SchemaFactory.createForClass(AvatarPiece);

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  _id: false,
})
export class Avatar {
  @Prop({ type: AvatarPieceSchema, required: true })
  head: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true })
  hair: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true })
  eyes: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true })
  nose: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true })
  mouth: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true })
  eyebrows: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true })
  clothes: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true })
  feet: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true })
  hands: AvatarPiece;

  @Prop({ type: String, required: true })
  skinColor: string;
}
export const AvatarSchema = SchemaFactory.createForClass(Avatar);
