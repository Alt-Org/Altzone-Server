import { Document, ObjectId } from "mongoose";

interface IClan extends Document{
    _id: ObjectId;
    gameId: string;
    name: string;
    tag: string;
    gameCoins: number;
}

interface ICreateClanInput{
    gameId: IClan['gameId'];
    name: IClan['name'];
    tag?: IClan['tag'];
    gameCoins?: IClan['gameCoins'];
}

interface IUpdateClanInput{
    _id: ObjectId;
    gameId?: IClan['gameId'];
    name?: IClan['name'];
    tag?: IClan['tag'];
    gameCoins?: IClan['gameCoins'];
}


export { IClan, ICreateClanInput, IUpdateClanInput };