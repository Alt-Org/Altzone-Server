import ClanModel from "./clan.model";
import {MongooseError, ObjectId, Query, UpdateQuery} from "mongoose";
import {ICreateClanInput, IUpdateClanInput} from "./clan";
import RequestError from "../util/error/requestError";

export default class ClanService{
    create = async (input: ICreateClanInput): Promise<Object | MongooseError | RequestError> => {
        const name = input.name;

        const clanWithName = await ClanModel.findOne({name});

         const isClanNull = clanWithName === null;
         if(!isClanNull)
             throw new RequestError(422, 'Clan with that name already exists');

        return ClanModel.create(input);
    }

    readById = async (id: string): Promise<Object | MongooseError | RequestError> => {
        const clanToReturn = await ClanModel.findById(id);

        if(!clanToReturn)
            throw new RequestError(404, 'Can not find Clan with that id');

        return clanToReturn;
    }

    readAll = async (): Promise<Object | MongooseError> => {
        return ClanModel.find();
    }

     update = async (input: IUpdateClanInput): Promise<boolean | MongooseError | RequestError> => {
        const { id, name, tag, gameCoins } = input;

        const clanToUpdate = await ClanModel.findById(id);

         if(!clanToUpdate)
             throw new RequestError(404, 'No Clan with that id found');

         let canUpdate;
         if(!name)
             canUpdate = true;
         else
             canUpdate = await canUpdateName(id, name);

        if(canUpdate){
            const updateResp = await ClanModel.updateOne({_id: id}, { name, tag, gameCoins }, { rawResult: true });
            return updateResp !== null;
        }

        throw new RequestError(422, 'Clan with that name already exists');
    }

    deleteById = async (id: string): Promise<boolean | MongooseError | RequestError> => {
        const deletedClan = await ClanModel.findByIdAndDelete(id);

        if(!deletedClan)
            throw new RequestError(404, 'Clan with that id not found')

        return true;
    }
}

async function canUpdateName(id: ObjectId, name: string): Promise<boolean> {
    const clanWithName = await ClanModel.findOne({name});
    
    if(clanWithName)
        return String(clanWithName._id) === String(id);

    return true;
}