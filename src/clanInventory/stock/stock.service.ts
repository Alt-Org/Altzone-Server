import {Injectable} from "@nestjs/common";
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Stock} from "./stock.schema";
import {CreateStockDto} from "./dto/createStock.dto";
import {UpdateStockDto} from "./dto/updateStock.dto";
import {StockDto} from "./dto/stock.dto";
import { ItemService } from "../item/item.service";
import { ModelName } from "../../common/enum/modelName.enum";
import BasicService from "../../common/service/basicService/BasicService";
import { TReadByIdOptions, TIServiceReadManyOptions } from "../../common/service/basicService/IService";
import ServiceError from "../../common/service/basicService/ServiceError";

@Injectable()
export class StockService {
    public constructor(
        @InjectModel(Stock.name) public readonly model: Model<Stock>,
        private readonly itemService: ItemService
    ){
        this.refsInModel = [ModelName.CLAN, ModelName.ITEM];
        this.modelName = ModelName.STOCK;
        this.basicService = new BasicService(model);
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    public readonly basicService: BasicService;

    /**
      * Creates a new Stock in DB.
      * 
      * @param stock - The Stock data to create.
      * @returns created Stock or an array of service errors if any occurred.
    */
    async createOne(stock: CreateStockDto) {
        return this.basicService.createOne<CreateStockDto, StockDto>(stock);
    }

    /**
      * Reads a Stock by its _id in DB.
      * 
      * @param _id - The Mongo _id of the Stock to read.
      * @param options - Options for reading the Stock.
      * @returns Stock with the given _id on succeed or an array of ServiceErrors if any occurred.
    */
    async readOneById(_id: string, options?: TReadByIdOptions) {
        const optionsToApply = options;
        if(options?.includeRefs)
            optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));
        return this.basicService.readOneById<StockDto>(_id, optionsToApply);
     }
 
    /**
      * Reads Stocks by specified options from DB.
      * 
      * @param options - Options for reading CharacterClasses.
      * @returns An array of Stocks if succeed or an array of ServiceErrors if any occurred.
     */
     async readAll(options?: TIServiceReadManyOptions) {
         const optionsToApply = options;
         if(options?.includeRefs)
             optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));
 
         return this.basicService.readMany<StockDto>(optionsToApply);
     }

    /**
      * Updates a Stock cellCount field by the specified amount.
      * 
      * @param _id - The Mongo _id of the Stock to be updated
      * @param cellCountChange - the amount the cellCount field will be updated on. It can be ever negative or positive number.
      * @returns _true_ if Stock was updated successfully, _false_ if nothing was updated for the Stock, 
      * or a ServiceError array if Stock was not found or something else went wrong.
    */
    public updateStockCellCount = async (_id: string, cellCountChange: number): Promise<[boolean | null, ServiceError[] | null]> => {
        const [stock, errors] = await this.basicService.readOneById<StockDto>(_id);
        if(errors || !stock)
            return [null, errors];

        const { cellCount } = stock;

        const requestedCellCount = cellCount + cellCountChange;
        const newCellCount = requestedCellCount < 0 ? 0 : requestedCellCount;

        return this.basicService.updateOneById(_id, { cellCount: newCellCount });
    }

    /**
      * Updates a Stock by its _id in DB. The _id field is read-only and must be found from the parameter
      * 
      * @param Stock - The data needs to be updated for the Stock.
      * @returns _true_ if Stock was updated successfully, _false_ if nothing was updated for the Stock, 
      * or a ServiceError array if Stock was not found or something else went wrong.
    */
    async updateOneById(stock: UpdateStockDto) {
        const {_id, ...fieldsToUpdate} = stock;
        return this.basicService.updateOneById(_id, fieldsToUpdate);
    }

    /**
      * Deletes a Stock its _id from DB.
      *
      * Notice that the method will also delete all Items inside of the Stock.
      * 
      * @param _id - The Mongo _id of the Stock to delete.
      * @returns _true_ if Stock was removed successfully, or a ServiceError array if the Stock was not found or something else went wrong
    */
    async deleteOneById(_id: string) {
        await this.itemService.deleteAllStockItems(_id);
        return this.basicService.deleteOneById(_id);
    }
}