import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

const wrapLegacyPiece = (val: any) => {
  return typeof val === 'number' ? { id: val, color: '#ffffff' } : val;
};

@Schema({ _id: false })
export class AvatarPiece {
  @Prop({ type: Number, required: true })
  id: number;

  @Prop({ type: String, required: true })
  color: string;
}

const AvatarPieceSchema = SchemaFactory.createForClass(AvatarPiece);

@Schema({
  toJSON: { virtuals: true, getters: true }, 
  toObject: { virtuals: true, getters: true },
  _id: false,
})
export class Avatar {
  @Prop({ type: AvatarPieceSchema, required: true, get: wrapLegacyPiece })
  head: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true, get: wrapLegacyPiece })
  hair: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true, get: wrapLegacyPiece })
  eyes: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true, get: wrapLegacyPiece })
  nose: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true, get: wrapLegacyPiece })
  mouth: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true, get: wrapLegacyPiece })
  eyebrows: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true, get: wrapLegacyPiece })
  clothes: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true, get: wrapLegacyPiece })
  feet: AvatarPiece;

  @Prop({ type: AvatarPieceSchema, required: true, get: wrapLegacyPiece })
  hands: AvatarPiece;

  @Prop({ type: String, required: true })
  skinColor: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);