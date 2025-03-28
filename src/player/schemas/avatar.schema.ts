import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ObjectId} from "mongodb";

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Avatar {
    @Prop({ type: Number, required: true })
    head: number;
    
    @Prop({ type: Number, required: true })
    hair: number;
    
    @Prop({ type: Number, required: true })
    eyes: number;
        
    @Prop({ type: Number, required: true })
    nose: number;
    
    @Prop({ type: Number, required: true })
    mouth: number;
    
    @Prop({ type: Number, required: true })
    eyebrows: number;
    
    @Prop({ type: Number, required: true })
    clothes: number;
    
    @Prop({ type: Number, required: true })
    feet: number;
    
    @Prop({ type: Number, required: true })
    hands: number;

    @Prop({ type: String, required: true })
    skinColor: string;

    _id: ObjectId;
}
export const AvatarSchema = SchemaFactory.createForClass(Avatar);