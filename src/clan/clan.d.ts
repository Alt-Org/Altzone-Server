import { Document, ObjectId } from "mongoose";

interface IClan extends Document{
    _id: ObjectId;
    name: string;
    tag: string;
    gameCoins: string;
}

interface ICreateClanInput{
    name: IClan['name'];
    tag?: IClan['tag'];
    gameCoins?: IClan['gameCoins'];
}

interface IUpdateClanInput{
    _id: IClan['_id']
    name?: IClan['name'];
    tag?: IClan['tag'];
    gameCoins?: IClan['gameCoins'];
}


export { IClan, ICreateClanInput, IUpdateClanInput };