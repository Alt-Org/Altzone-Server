import {Injectable} from "@nestjs/common";
import {Model, MongooseError, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Profile, ProfileDocument} from "./profile.schema";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {PlayerService} from "../player/player.service";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {IBasicService} from "../common/base/interface/IBasicService";

//TODO: password hashing via bcrypt

@Injectable()
@AddBasicService()
export class ProfileService extends BasicServiceDummyAbstract<ProfileDocument> implements IBasicService<ProfileDocument>{
    public constructor(
        @InjectModel(Profile.name) public readonly model: Model<Profile>,
        private readonly playerService: PlayerService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.PLAYER];
    }

    public readonly refsInModel: ModelName[];

    public createWithHashedPassword(condition: object): Promise<MongooseError | Profile | null> {
        //TODO: hash psw here
        return ;
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        await this.playerService.deleteByCondition({profile_id: _id}, {isOne: true});
    }
}