import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {ClanMeta} from "./clanMeta.schema";
import {InjectModel} from "@nestjs/mongoose";
import {ModelName} from "../../common/enum/modelName.enum";
import { IMetaService } from "../interface/IMetaService";

@Injectable()
export class ClanMetaService implements IMetaService<ClanMeta>{
    public constructor(
        @InjectModel(ModelName.CLAN_META) public readonly model: Model<ClanMeta>,
    ){
    }

    public async countPlayers(_id: string, change: number): Promise<boolean> {
        const count = (await this.model.findById(_id)).playerCount;
        let newValue = count + change;
        if(newValue)

        return this.model.updateOne(newMetaData);
    }

    public async createMetaData(newMetaData: Partial<ClanMeta>): Promise<ClanMeta> {
        return this.model.create(newMetaData);
    }
    public async readMetaData = (_id: string): Promise<ClanMeta> => {
        return this.model.findById(_id);
    }
    public async deleteMetaData(_id: string | Types.ObjectId): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}