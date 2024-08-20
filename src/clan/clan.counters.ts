import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import Counter from "src/common/service/counter/Counter";
import ICounterFactory from "src/common/service/counter/ICounterFactory";
import { Clan } from "./clan.schema";

@Injectable()
export class PlayerCounterFactory implements ICounterFactory{
    public constructor(@InjectModel('Clan') public readonly model: Model<Clan>) {}

    create() {
        return new Counter({model: this.model, counterField: 'playerCount'});
    };
}