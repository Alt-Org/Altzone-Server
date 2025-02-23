import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {ObjectId} from "mongodb";
import {ModelName} from "../../common/enum/modelName.enum";

/**
 * Tester is a user that have access to the box resources
 */
@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Tester {
    /**
     * Profile _id of the tester
     */
    @Prop({ type: ObjectId, required: true, ref: ModelName.PROFILE })
    profile_id: ObjectId;

    /**
     * Profile _id of the tester
     */
    @Prop({ type: ObjectId, required: true, ref: ModelName.PLAYER })
    player_id: ObjectId;

    /**
     * Has the account already been claimed by some device
     */
    @Prop({ type: Boolean, default: false })
    isClaimed: boolean;
}

export const TesterSchema = SchemaFactory.createForClass(Tester);
