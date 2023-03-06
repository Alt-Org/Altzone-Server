import ClanModel from "./clan.model";
import {MongooseError, ObjectId} from "mongoose";
import {IUpdateClanInput} from "./clan";
import RequestError from "../util/error/RequestError";

export default class ClanService{
     update = async (input: IUpdateClanInput): Promise<Object | MongooseError | RequestError> => {
        const { id, name, tag, gameCoins } = input;

        const clanToUpdate = await ClanModel.findById(id);

         let canUpdate = false;
         if(!clanToUpdate)
             throw new RequestError(400, 'No Clan with that id found');
         if(!name)
             canUpdate = true;
         else
             canUpdate = await canUpdateName(id, name);

        if(canUpdate)
            return ClanModel.updateOne({_id: id}, { name, tag, gameCoins });

         throw new RequestError(400, 'Can not change name field: Clan with that name already exists');
    }
}

async function canUpdateName(id: ObjectId, name: string): Promise<boolean> {
    const clanWithName = await ClanModel.findOne({name});
    if(clanWithName)
        return clanWithName._id === id;

    return true;
}