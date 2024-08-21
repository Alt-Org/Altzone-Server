import { Body, Injectable, NotFoundException } from "@nestjs/common";
import { BasicServiceDummyAbstract } from "../common/base/abstract/basicServiceDummy.abstract";
import { AddBasicService, ClearCollectionReferences } from "../common/base/decorator/AddBasicService.decorator";
import { SoulHome } from "./soulhome.schema";
import { IBasicService } from "../common/base/interface/IBasicService";
import { InjectModel } from "@nestjs/mongoose";
import { Model, MongooseError, Types } from "mongoose";
import { StockService } from "../stock/stock.service";
import { RequestHelperService } from "../requestHelper/requestHelper.service";
import { ModelName } from "../common/enum/modelName.enum";
import { IgnoreReferencesType } from "../common/type/ignoreReferences.type";
import { RoomService } from "../room/room.service";
import { updateSoulHomeDto } from "./dto/updateSoulHome.dto";
import { deleteArrayElements } from "../common/function/deleteArrayElements";

@Injectable()
@AddBasicService()
export class SoulHomeService extends BasicServiceDummyAbstract<SoulHome> implements IBasicService<SoulHome> {

    public constructor(
        @InjectModel(SoulHome.name) public readonly model: Model<SoulHome>,
        private readonly roomService: RoomService,
        private readonly requestHelperService: RequestHelperService
    ) {
        super();
        this.refsInModel = [ModelName.CLAN, , ModelName.ROOM];
        this.modelName = ModelName.SOULHOME;
    }
    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    public async handleUpdate(@Body() body: updateSoulHomeDto) {
        if (!body.addedRooms && !body.removedRooms) {
            return this.updateOneById(body);
        }
        const homeToUpdate = await this.readOneById(body._id);
        if (!homeToUpdate || homeToUpdate instanceof MongooseError)
            throw new NotFoundException('SoulHome with that _id not found');
        body["rooms"] = homeToUpdate.data[homeToUpdate.metaData.dataKey].rooms;
        if (body.removedRooms)
            body["rooms"] = deleteArrayElements(body["rooms"], body.removedRooms);
        const rooms = body["rooms"];
        if (!body.addedRooms)
            return this.updateOneById(body);
        body.addedRooms.forEach((o, i) => {
            rooms.push(o);
        });
        body["rooms"] = rooms;
        return this.updateOneById(body);

    }
    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const searchFilter = { soulHome_id: _id };
        await this.roomService.deleteByCondition(searchFilter);
    }
}
