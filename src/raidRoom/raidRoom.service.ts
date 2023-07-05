import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {AddBaseService} from "../common/base/decorator/AddBaseService.decorator";
import {ServiceDummyAbstract} from "../common/base/serviceDummy.abstract";
import {IService} from "../common/base/interface/IService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {RaidRoom} from "./raidRoom.schema";

@Injectable()
@AddBaseService()
export class RaidRoomService extends ServiceDummyAbstract implements IService{
    public constructor(
        @InjectModel(RaidRoom.name) public readonly model: Model<RaidRoom>,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [];
    }

    public readonly refsInModel: ModelName[];

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
    }
}