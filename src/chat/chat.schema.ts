import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";
import {ExtractField} from "../common/decorator/response/ExtractField";
import {ObjectId} from "mongodb";

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }, _id: false, id: false})
export class Message {
    @Prop({ type: Number, required: true })
    id: number;

    @Prop({ type: String, required: true })
    senderUsername: string;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: Number, required: true })
    feeling: number;
}
const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class Chat {
    @Prop({ type: String, required: false })
    name: string;

    //add validate func, if needed (the only way to check is _id unique)
    @Prop({type: [MessageSchema], required: true, default: [], _id: false})
    messages: Message[] = [];

    @ExtractField()
    _id: ObjectId;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
ChatSchema.set('collection', ModelName.CHAT);