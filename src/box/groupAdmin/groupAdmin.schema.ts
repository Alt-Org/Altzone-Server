import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";
import {ModelName} from "../../common/enum/modelName.enum";
import {ObjectId} from "mongodb";
import {ExtractField} from "../../common/decorator/response/ExtractField";

export type GroupAdminDocument = HydratedDocument<GroupAdmin>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class GroupAdmin {
    @Prop({ type: String, required: true, unique: true })
    password: string;

    @ExtractField()
    _id: ObjectId;
}

export const GroupAdminSchema = SchemaFactory.createForClass(GroupAdmin);
GroupAdminSchema.set('collection', ModelName.GROUP_ADMIN);
GroupAdminSchema.virtual(ModelName.BOX, {
    ref: ModelName.SOULHOME,
    localField : "password",
    foreignField :"adminPassword",
    justOne: true
});

export const publicReferences = [ ModelName.BOX ];
