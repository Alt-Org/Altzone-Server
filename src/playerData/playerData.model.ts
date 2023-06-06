import mongoose, {Schema} from "mongoose";
import {IPlayerData} from "./playerData";
import {ClassName} from "../util/dictionary";
import SchemaValidator from "../util/schemaHelper/schemaValidator";

const schema = new Schema({
    name: { type: String, required: true, unique: true },
    backpackCapacity: { type: Number, required: true },
    uniqueIdentifier: { type: String, required: true, unique: true },

    currentCustomCharacter_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.CUSTOM_CHARACTER,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.CUSTOM_CHARACTER), v)
        }
    },
    clan_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.CLAN,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.CLAN), v)
        }
    },

    raidRoom_id: {
        type: Schema.Types.ObjectId,
        ref: ClassName.RAID_ROOM,
        validate : {
            isAsync: true,
            validator: (v: Schema.Types.ObjectId) => SchemaValidator.validateCreateUpdateFK(mongoose.model(ClassName.RAID_ROOM), v)
        }
    }
},
{toJSON: {virtuals: true}, toObject: {virtuals: true}}
);

schema.virtual('CurrentCustomCharacter', {
    ref: ClassName.CUSTOM_CHARACTER,
    localField: 'currentCustomCharacter_id',
    foreignField: '_id',
    justOne: true
});

schema.virtual(ClassName.CLAN, {
    ref: ClassName.CLAN,
    localField: 'clan_id',
    foreignField: '_id',
    justOne: true
});

schema.virtual(ClassName.RAID_ROOM, {
    ref: ClassName.RAID_ROOM,
    localField: 'raidRoom_id',
    foreignField: '_id',
    justOne: true
});

//Force delete. If there is a need for save delete make a check in controller, before calling deleteOne()
schema.pre('deleteOne', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const customCharacterModel = mongoose.model(ClassName.CUSTOM_CHARACTER);
    await customCharacterModel.deleteMany({playerData_id: _id});

    const raidRoomModel = mongoose.model(ClassName.RAID_ROOM);
    await raidRoomModel.deleteOne({playerData_id: _id});
});

schema.pre('deleteMany', { document: false, query: true },async function () {
    const {_id} = this.getQuery();

    const customCharacterModel = mongoose.model(ClassName.CUSTOM_CHARACTER);
    await customCharacterModel.deleteMany({playerData_id: _id});

    const raidRoomModel = mongoose.model(ClassName.RAID_ROOM);
    await raidRoomModel.deleteOne({playerData_id: _id});
});

export default mongoose.model<IPlayerData>(ClassName.PLAYER_DATA, schema);