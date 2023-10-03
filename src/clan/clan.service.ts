import {Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {Clan} from "./clan.schema";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {RaidRoomService} from "../raidRoom/raidRoom.service";
import {FurnitureService} from "../furniture/furniture.service";
import {
    AddBasicService,
    ClearCollectionReferences,
    GetDocumentMetaData
} from "../common/base/decorator/AddBasicService.decorator";
import {AddConditionService} from "../common/base/decorator/AddConditionService.decorator";
import IBasicAndConditionService from "../common/base/interface/IBasicAndConditionService";
import {BasicAndConditionServiceDummyAbstract} from "../common/base/abstract/basicAndConditionServiceDummy.abstract";

@Injectable()
@AddConditionService()
@AddBasicService()
export class ClanService extends BasicAndConditionServiceDummyAbstract<Clan> implements IBasicAndConditionService<Clan>{
    public constructor(
        @InjectModel(Clan.name) public readonly model: Model<Clan>,
        private readonly raidRoomService: RaidRoomService,
        private readonly furnitureService: FurnitureService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.PLAYER, ModelName.RAID_ROOM, ModelName.FURNITURE];
        this.modelName = ModelName.CLAN;
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const searchFilter = { clan_id: _id };
        const nullIds = { clan_id: null };

        await this.requestHelperService.nullReferences([
            {modelName: ModelName.PLAYER, filter: searchFilter, nullIds}
        ], ignoreReferences);

        await this.raidRoomService.deleteByCondition(searchFilter);
        await this.furnitureService.deleteByCondition(searchFilter);
    }

    public getDocumentMetaData: GetDocumentMetaData = async (_id, metaData: string[]): Promise<object> => {
        const documentMeta = {};

        //TODO: add collection with metadata instead
        //TODO: add some DTOs or arr for available metadata

        if(metaData.includes('playerCount')){
            const resp = await this.model.findById(_id).populate([ModelName.PLAYER]);
            documentMeta['playerCount'] = resp['Player'] ? resp['Player'].length : 0;
        }

        if(metaData.includes('adminCount')){
            const resp = await this.model.findById(_id);
            documentMeta['adminCount'] = resp?.admin_ids?.length;
        }

        if(metaData.includes('furnitureCount')){
            const resp = await this.model.findById(_id).populate([ModelName.FURNITURE]);
            documentMeta['furnitureCount'] = resp['Furniture'] ? resp['Furniture'].length : 0;
        }

        if(metaData.includes('raidRoomCount')){
            const resp = await this.model.findById(_id).populate([ModelName.RAID_ROOM]);
            documentMeta['raidRoomCount'] = resp['RaidRoom'] ? resp['RaidRoom'].length : 0;
        }

        return documentMeta;
    }
}