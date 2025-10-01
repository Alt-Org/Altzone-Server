import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';

@Schema({
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
  timestamps: true,
})
export class TeacherProfile {
  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: true })
  password: string;
}

export const TeacherProfileSchema =
  SchemaFactory.createForClass(TeacherProfile);

TeacherProfileSchema.set('collection', ModelName.TEACHER_PROFILE);
