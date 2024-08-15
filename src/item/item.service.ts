import {Injectable} from "@nestjs/common";
import {Model, MongooseError, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {Item} from "./item.schema";
import {CreateItemDto} from "./dto/createItem.dto";
import {UpdateItemDto} from "./dto/updateItem.dto";
import {ItemDto} from "./dto/Item.dto";
import BasicService from "src/common/service/basicService/BasicService";
import { TIServiceReadManyOptions, TReadByIdOptions } from "src/common/service/basicService/IService";

@Injectable()
export class ItemService {
    public constructor(
        @InjectModel(Item.name) public readonly model: Model<Item>,
        //public readonly model: Model<Item>,
        private readonly requestHelperService: RequestHelperService
    ){
        //super();
        this.refsInModel = [ModelName.STOCK];
        this.modelName = ModelName.ITEM;
        this.basicService = new BasicService(model);
   }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    public readonly basicService: BasicService;

//    public createMany = async (items: CreateItemDto[]): Promise<boolean> => {
//        const resp = await this.model.insertMany(items);
//        return resp && !(resp instanceof MongooseError);
//    }
//    public createManyWithResponse = async (items: CreateItemDto[]) => {
//        const resp = await this.model.insertMany(items);
//        return resp;        
//    }

 //   public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> //=> {
 //   }


  /**
    * Creates a new Item in DB.
    * 
    * @param Item - The Item data to create.
    * @returns  created Item or an array of service errors if any occurred.
    */
    async createOne(Item: CreateItemDto) {
        //If you need you can specify types for some BasicService methods
        return this.basicService.createOne<CreateItemDto, ItemDto>(Item);
    }

    async createMany(items: CreateItemDto[]) {
	return this.basicService.createMany<CreateItemDto, ItemDto[]>(items);
    }
    async createManyWithResponse(items: CreateItemDto[]) {
        return this.basicService.createMany<CreateItemDto, ItemDto[]>(items);
    }


    /**
    * Reads a item by its _id in DB.
    * 
    * @param _id - The Mongo _id of the Item to read.
    * @param options - Options for reading the Item.
    * @returns Item with the given _id on succeed or an array of ServiceErrors if any occurred.
    */
    async readOneById(_id: string, options?: TReadByIdOptions) {
       let optionsToApply = options;
       if(options?.includeRefs)
           optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));
       return this.basicService.readOneById<ItemDto>(_id, optionsToApply);
    }

    /**
    * Updates a Item by its _id in DB. The _id field is read-only and must be found from the parameter
    * 
    * @param Item - The data needs to be updated for the Item.
    * @returns _true_ if Item was updated successfully, _false_ if nothing was updated for the Item, 
     * or a ServiceError array if Item was not found or something else went wrong.
    */
    async updateOneById(Item: UpdateItemDto) {
        const {_id, ...fieldsToUpdate} = Item
        return this.basicService.updateOneById(_id, fieldsToUpdate);
    }

    /**
    * Deletes a Item its _id from DB.
    * 
    * @param _id - The Mongo _id of the Item to delete.
    * @returns _true_ if Item was removed successfully, or a ServiceError array if the Item was not found or something else went wrong
    */
    async deleteOneById(_id: string) {
        return this.basicService.deleteOneById(_id);
    }
}