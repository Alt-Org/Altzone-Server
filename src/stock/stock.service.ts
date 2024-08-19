import {Injectable, NotFoundException } from "@nestjs/common";
import {Model, MongooseError, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {Stock} from "./stock.schema";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {IHookImplementer, PostCreateHookFunction, PostHookFunction} from "../common/interface/IHookImplementer";
import {CreateStockDto} from "./dto/createStock.dto";
import {UpdateStockDto} from "./dto/updateStock.dto";
import {StockDto} from "./dto/stock.dto";
import { TIServiceReadManyOptions, TReadByIdOptions } from "src/common/service/basicService/IService";
import BasicService from "src/common/service/basicService/BasicService";
import ServiceError from "src/common/service/basicService/ServiceError";
import { isServiceError } from "src/common/service/basicService/ServiceError";

@Injectable()
//@AddBasicService()
export class StockService {//extends BasicServiceDummyAbstract<Stock> implements IBasicService<Stock>, IHookImplementer{
    public constructor(
        @InjectModel(Stock.name) public readonly model: Model<Stock>,
        private readonly requestHelperService: RequestHelperService
    ){
        //super();
        this.refsInModel = [ModelName.CLAN, ModelName.ITEM];
        this.modelName = ModelName.STOCK;
        this.basicService = new BasicService(model);
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    public readonly basicService: BasicService;

/*    public createOnePostHook: PostCreateHookFunction = async (input: CreateStockDto, output: Stock): Promise<boolean> => {
        if(!input?.clan_id)
            return true;

        const isRaidRoomCountIncreased = await this.requestHelperService.changeCounterValue(ModelName.CLAN, {_id: input.clan_id}, 'stockCount', 1);
        return isRaidRoomCountIncreased;
    }

    public updateOnePostHook: PostHookFunction = async (input: Partial<UpdateStockDto>, oldDoc: Stock, output: Stock): Promise<boolean> => {
        if(!input?.clan_id)
            return true;

        const changeCounterValue = this.requestHelperService.changeCounterValue;

        const clanRemoveFrom_id = oldDoc.clan_id;
        if(clanRemoveFrom_id)
            await changeCounterValue(ModelName.CLAN, {_id: clanRemoveFrom_id}, 'stockCount', -1);

        const isRaidRoomCountIncreased = await changeCounterValue(ModelName.CLAN, {_id: input.clan_id}, 'stockCount', 1);
        return isRaidRoomCountIncreased;
    }

    public deleteOnePostHook: PostHookFunction = async (input: any, oldDoc: Stock, output: Stock): Promise<boolean> => {
        const clan_id = oldDoc.clan_id;

        if(!clan_id)
            return true;

        const isRaidRoomCountIncreased = await this.requestHelperService.changeCounterValue(ModelName.CLAN, {_id: clan_id}, 'stockCount', -1);
        return isRaidRoomCountIncreased;
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
    }*/

  /**
    * Creates an new Stock in DB.
    * 
    * @param item - The Stock data to create.
    * @returns  created Stock or an array of service errors if any occurred.
    */
    async createOne(stock: CreateStockDto) {
        return this.basicService.createOne<CreateStockDto, StockDto>(stock);
    }

    /**
    * Creates many new Items in DB.
    * 
    * @param items - The Items data to create.
    * @returns created Item or an array of service errors if any occurred.
    */
    //async createMany(items: CreateItemDto[]) {
	//    return this.basicService.createMany<CreateItemDto, ItemDto[]>(items);
    //}

    /**
    * Creates many new Items in DB.
    * 
    * @deprecated The createMany() method should be used instead
    * @param items - The Items data to create.
    * @returns created Item or an array of service errors if any occurred.
    */
    //async createManyWithResponse(items: CreateItemDto[]) {
    //    return this.basicService.createMany<CreateItemDto, ItemDto[]>(items);
   //}

  /**
    * Updates an Stock by its cellCount in DB. The cellCount field is read-only and must be found from the parameter
    * 
    * @param Stock - The data needs to be updated for the Stock.
    * @returns _true_ if Stock was updated successfully, _false_ if nothing was updated for the Stock, 
     * or a ServiceError array if Stock was not found or something else went wrong.
    */
    async updateOneBycellcount(Stock: UpdateStockDto) {
       const {_id, cellCount, ...fieldsToUpdate} = Stock;
       const x = await this.basicService.readOneById<StockDto>(_id);
       if (isServiceError(x))
         return x as ServiceError[]; 
       const stock = x as unknown as Stock;
       stock.cellCount = cellCount;
       return this.basicService.updateOneById(_id, stock);
    }

    /**
    * Reads an Stock by its _id in DB.
    * 
    * @param _id - The Mongo _id of the Stock to read.
    * @param options - Options for reading the Stock.
    * @returns Stock with the given _id on succeed or an array of ServiceErrors if any occurred.
    */
    async readOneById(_id: string, options?: TReadByIdOptions) {
       let optionsToApply = options;
       if(options?.includeRefs)
           optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));
       return this.basicService.readOneById<StockDto>(_id, optionsToApply);
    }

    /**
    * Reads all Stocks by its in DB.
    * 
    * @param options - Options for reading CharacterClasses.
    * @returns An array of Stocks if succeed or an array of ServiceErrors if any occurred.
    */
    async readAll(options?: TIServiceReadManyOptions) {
        let optionsToApply = options;
        if(options?.includeRefs)
            optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));

        return this.basicService.readMany<StockDto>(optionsToApply);
    }

    /**
    * Updates an Stock by its _id in DB. The _id field is read-only and must be found from the parameter
    * 
    * @param Stock - The data needs to be updated for the Stock.
    * @returns _true_ if Item was updated successfully, _false_ if nothing was updated for the Stock, 
     * or a ServiceError array if Stock was not found or something else went wrong.
    */
    async updateOneById(Stock: UpdateStockDto) {
        const {_id, ...fieldsToUpdate} = Stock
        return this.basicService.updateOneById(_id, fieldsToUpdate);
    }

    /**
    * Deletes an Stock its _id from DB.
    * 
    * @param _id - The Mongo _id of the Stock to delete.
    * @returns _true_ if Item was removed successfully, or a ServiceError array if the Stock was not found or something else went wrong
    */
    async deleteOneById(_id: string) {
        return this.basicService.deleteOneById(_id);
    }
}