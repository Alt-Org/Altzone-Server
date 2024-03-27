import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { ExtractField } from "src/common/decorator/response/ExtractField";
import { ModelName } from "src/common/enum/modelName.enum";
export type JoinDocument = HydratedDocument<Join>;
@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Join {
    @Prop({ type: String, required: true, unique: false })
    player_id: string;
    @Prop({ type: String, required: true, unique: false })
    clan_id: string;
    @Prop({ type: String, required: false, unique: false})
    join_message: string;

    @Prop({type:Boolean, required: false, unique: false , default: false})
    accepted: boolean;

    @ExtractField()
    _id:string;
}

export const joinSchema = SchemaFactory.createForClass(Join);
joinSchema.set('collection', ModelName.JOIN);