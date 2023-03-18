import { Document, ObjectId } from "mongoose";

interface IClan extends Document{
    _id: ObjectId;
    name: string;
    tag: string;
    gameCoins: Number;
}

interface ICreateClanInput{
    name: IClan['name'];
    tag?: IClan['tag'];
    gameCoins?: IClan['gameCoins'];
}

interface IUpdateClanInput{
    id: ObjectId;
    name?: IClan['name'];
    tag?: IClan['tag'];
    gameCoins?: IClan['gameCoins'];
}


export { IClan, ICreateClanInput, IUpdateClanInput };