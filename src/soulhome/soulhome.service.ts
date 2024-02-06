import { Injectable } from "@nestjs/common";
import { BasicServiceDummyAbstract } from "src/common/base/abstract/basicServiceDummy.abstract";
import { AddBasicService, ClearCollectionReferences } from "src/common/base/decorator/AddBasicService.decorator";
import { SoulHome } from "./soulhome.schema";
import { IBasicService } from "src/common/base/interface/IBasicService";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StockService } from "src/stock/stock.service";
import { RequestHelperService } from "src/requestHelper/requestHelper.service";
import { ModelName } from "src/common/enum/modelName.enum";
import { IgnoreReferencesType } from "src/common/type/ignoreReferences.type";
import { RoomService } from "src/Room/room.service";

@Injectable()
@AddBasicService()
export class SoulHomeService extends BasicServiceDummyAbstract<SoulHome> implements IBasicService<SoulHome> { 
    
    public constructor(
        @InjectModel(SoulHome.name) public readonly model: Model<SoulHome>,
        private readonly roomService: RoomService,
        private readonly requestHelperService: RequestHelperService
    ) {
        super();
        this.refsInModel = [ModelName.CLAN, ,ModelName.ROOM];
        this.modelName = ModelName.SOULHOME;
    }
    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const searchFilter = { soulHome_id: _id };
        
        await this.roomService.deleteByCondition(searchFilter);
    }
 }
