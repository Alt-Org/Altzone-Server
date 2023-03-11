import ClanModel from "./clan.model";
import {MongooseError, ObjectId} from "mongoose";
import {ICreateClanInput, IUpdateClanInput} from "./clan";
import RequestError from "../util/error/RequestError";

export default class ClanService{
    create = async (input: ICreateClanInput) => {
        const { name, tag, gameCoins } = input;

        const clanWithName = await ClanModel.findOne({filter: name});

         const isClanNull = clanWithName === null;
         if(isClanNull)
             throw new RequestError(400, 'Clan with that name already exists');

        return ClanModel.create(input);
    }

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

         throw new RequestError(400, 'Clan with that name already exists');
    }
}

async function canUpdateName(id: ObjectId, name: string): Promise<boolean> {
    const clanWithName = await ClanModel.findOne({name});
    
    if(clanWithName)
        return String(clanWithName._id) === String(id);

    return true;
}