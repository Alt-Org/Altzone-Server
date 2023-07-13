import {HydratedDocument} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {ModelName} from "../common/enum/modelName.enum";

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ toJSON: { virtuals: true, getters: true }, toObject: { virtuals: true, getters: true }})
export class Profile {
    @Prop({ type: String, required: true, unique: true })
    username: string;

    @Prop({ type: String, required: true })
    password: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
ProfileSchema.set('collection', ModelName.PROFILE);
ProfileSchema.virtual(ModelName.PLAYER, {
    ref: ModelName.CLAN,
    localField: '_id',
    foreignField: 'profile_id',
    justOne: true
});