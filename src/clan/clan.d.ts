import { Document, ObjectId } from "mongoose";

declare namespace clan{
    interface IClan extends Document{
        _id: ObjectId;
        name: string;
        tag: string;
        gameCoins: string;
    }

    interface ICreateInput{
        name: IClan['name'];
        tag?: IClan['tag'];
        gameCoins?: IClan['gameCoins'];
    }

    interface IUpdateInput{
        _id: IClan['_id']
        name?: IClan['name'];
        tag?: IClan['tag'];
        gameCoins?: IClan['gameCoins'];
    }
}

export = clan;