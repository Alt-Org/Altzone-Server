import {Prop, raw, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument, Schema as MongooseSchema} from "mongoose";
import {ModelName} from "../common/enum/modelName.enum";

export type ChatDocument = HydratedDocument<Chat>;

const testObj = {
    _id: {type: String, required: true, unique: true},
    senderUsername: {type: String, required: true, unique: true},
    content: {type: String, required: true},
    feeling: {type: Number, required: true},
};

const testSchema = new MongooseSchema(testObj, { toJSON: { virtuals: true }, toObject: { virtuals: true }, _id: false});

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }, _id: false})
class Message {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ type: String, required: true })
    senderUsername: string;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: Number, required: true })
    feeling: number;
}
const MessageSchema = SchemaFactory.createForClass(Message);

// validate: () => {console.log('validate'); return true}
//{ type: [Message], required: true, default: [] }
@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true }})
export class Chat {
    @Prop({ type: String, required: false, unique: true })
    name: string;

    //TODO: add validate func (the only way to check is _id unique)
    @Prop({
        type: [MessageSchema],
        required: true,
        default: [],
        validate: () => {

            console.log('validate');
            return true;
        }
    })
    messages: Message[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
ChatSchema.set('collection', ModelName.CHAT);