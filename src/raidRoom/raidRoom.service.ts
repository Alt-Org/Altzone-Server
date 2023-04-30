import RaidRoomModel from "./raidRoom.model";
import {MongooseError} from "mongoose";
import {ICreateRaidRoomInput, IUpdateRaidRoomInput} from "./raidRoom";
import RequestError from "../util/error/requestError";
import {UpdateResult} from "mongodb";

export default class RaidRoomService {
    create = async (input: ICreateRaidRoomInput): Promise<Object | MongooseError | RequestError> => {
        return RaidRoomModel.create(input);
    }

    readById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return RaidRoomModel.findById(_id);
    }

    readAll = async (): Promise<Array<any>> => {
        return RaidRoomModel.find();
    }

     updateById = async (input: IUpdateRaidRoomInput): Promise<UpdateResult> => {
        return RaidRoomModel.updateOne({_id: input._id}, input, {rawResult: true, runValidators: true});
    }

    deleteById = async (_id: string): Promise<Object | null | MongooseError | RequestError> => {
        return RaidRoomModel.deleteOne({_id});
    }
}