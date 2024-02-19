import { Body, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, MongooseError, Types } from "mongoose";
import { BasicServiceDummyAbstract } from "src/common/base/abstract/basicServiceDummy.abstract";
import { AddBasicService, ClearCollectionReferences } from "src/common/base/decorator/AddBasicService.decorator";
import { IBasicService } from "src/common/base/interface/IBasicService";
import { RequestHelperService } from "src/requestHelper/requestHelper.service";
import { StockService } from "src/stock/stock.service";
import { Room } from "./room.schema";
import { ModelName } from "src/common/enum/modelName.enum";
import { IgnoreReferencesType } from "src/common/type/ignoreReferences.type";
import { SoulHome, SoulhomeSchema } from "src/soulhome/soulhome.schema";
import { IHookImplementer, PostHookFunction } from "src/common/interface/IHookImplementer";
import { UpdateRoomDto } from "./dto/updateRoom.dto";
import { roomRules } from "src/authorization/rule/roomRules";
import { deleteArrayElements } from "src/common/function/deleteArrayElements";
import { addUniqueArrayElements } from "src/common/function/addUniqueArrayElements";
import { deleteNotUniqueArrayElements } from "src/common/function/deleteNotUniqueArrayElements";

@Injectable()
@AddBasicService()
export class RoomService extends BasicServiceDummyAbstract<Room> implements IBasicService<Room> ,IHookImplementer {

    public constructor(
        @InjectModel(Room.name) public readonly model: Model<Room>,
        private readonly requestHelperService: RequestHelperService
    ) {
        super();
        this.refsInModel = [ModelName.PLAYER, ModelName.ITEM, ModelName.SOULHOME];
        this.modelName = ModelName.ROOM;
    }
    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;

    public async handleUpdate(@Body() body: UpdateRoomDto) {
        if (!body.roomItemsToAdd && !body.roomItemsToRemove) {
            return this.updateOneById(body);
        }

        const roomToUpdate = await this.readOneById(body._id);

        if (!roomToUpdate || roomToUpdate instanceof MongooseError)
            throw new NotFoundException('Room with that _id not found');

        body["roomItems"] = roomToUpdate.data[roomToUpdate.metaData.dataKey].roomItems;

        if (body.roomItemsToRemove)
            body["roomItems"] =  deleteArrayElements(body["roomItems"], body.roomItemsToRemove);

        const roomItems = body["roomItems"];

        if(!body.roomItemsToAdd) 
            return this.updateOneById(body);

        body.roomItemsToAdd.forEach((o,i) => {
            roomItems.push(o);
        });

        body["roomItems"] = roomItems;
        
        return this.updateOneById(body);

    }

    public deleteOnePostHook: PostHookFunction = async (input: any, oldDoc: Partial<Room>, output: Partial<Room>): Promise<boolean> => { 
        if(!oldDoc.soulHome_id)
            return true;

        const soulHome = await this.requestHelperService.getModelInstanceById(ModelName.SOULHOME,oldDoc.soulHome_id,SoulHome);
        const id = [oldDoc._id.toString()] // hack for delete;
        let newRoom = deleteArrayElements(soulHome.rooms,id);
        await this.requestHelperService.updateOneById(ModelName.SOULHOME,oldDoc.soulHome_id,{rooms: newRoom})
        return true;
    }

    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        
    }
}
