import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {ClanMeta} from "./clanMeta.schema";
import {InjectModel} from "@nestjs/mongoose";
import {ModelName} from "../../common/enum/modelName.enum";
import { IMetaService } from "../interface/IMetaService";

@Injectable()
export class ClanMetaService implements IMetaService<ClanMeta>{
    public constructor(
        @InjectModel(ModelName.CLAN_META) public readonly model: Model<ClanMeta>
    ){
    }

    public async countPlayers(_id: string, change: number): Promise<boolean> {
        if(change === 0)
            return true;

        const currentCount = (await this.model.findById(_id)).playerCount;
        const newCount = currentCount + change;
        if(newCount){
            const updateResponse = await this.model.updateOne({_id}, {playerCount: newCount});
            const isCountModified = updateResponse.modifiedCount !== 0;
            return isCountModified;
        }

        return false;
    }

    public async createMetaData(newMetaData: Partial<ClanMeta>): Promise<ClanMeta> {
        try {
            return await this.model.create(newMetaData);
        } catch (e) {
            console.log(e)
        }

    }

    public async readMetaData(_id: string): Promise<ClanMeta> {
        return this.model.findById(_id);
    }

    public async deleteMetaData(_id: string | Types.ObjectId): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}