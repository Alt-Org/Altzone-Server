import {InjectConnection} from "@nestjs/mongoose";
import {Connection} from "mongoose";
import {ModelName} from "../enum/modelName.enum";
import {Injectable} from "@nestjs/common";

@Injectable()
export class SystemAdminService {
    public constructor(@InjectConnection() private readonly connection: Connection) {}
    private readonly adminProfile_ids: string[] = [];

    public getSystemAdminProfile_ids = async (): Promise<string[]> => {
        if(this.adminProfile_ids.length === 0){
            const _ids = await this.connection.model(ModelName.PROFILE).find({ isSystemAdmin: true }).select('_id');
            for(let i=0; i<_ids.length; i++)
                this.adminProfile_ids.push(_ids[i].id);
        }

        return this.adminProfile_ids;
    }

    public isSystemAdmin = async (profile_id: string): Promise<boolean> => {
        if(this.adminProfile_ids.length === 0)
            await this.getSystemAdminProfile_ids();

        return this.adminProfile_ids.includes(profile_id);
    }

    public addSystemAdmin = async (profile_id: string): Promise<boolean> => {
        if(!await this.isSystemAdmin(profile_id)){
            this.adminProfile_ids.push(profile_id);
            const resp = await this.connection.model(ModelName.PROFILE).updateOne({_id: profile_id}, { isSystemAdmin: true }, {rawResult: true});

            return resp.modifiedCount === 1;
        }

        return true;
    }

    public removeSystemAdmin = async (profile_id: string): Promise<boolean> => {
        if(await this.isSystemAdmin(profile_id)){
            const index = this.adminProfile_ids.indexOf(profile_id);
            this.adminProfile_ids.splice(index, 1);

            const resp = await this.connection.model(ModelName.PROFILE).updateOne({_id: profile_id}, { isSystemAdmin: false }, {rawResult: true});
            return resp.modifiedCount === 1;
        }

        return true;
    }
}