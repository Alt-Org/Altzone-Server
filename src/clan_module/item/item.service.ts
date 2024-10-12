import {Injectable} from "@nestjs/common";
import {Model} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Item} from "./item.schema";
import {CreateItemDto} from "./dto/createItem.dto";
import {UpdateItemDto} from "./dto/updateItem.dto";
import {ItemDto} from "./dto/item.dto";
import { ModelName } from "../../common/enum/modelName.enum";
import BasicService from "../../common/service/basicService/BasicService";
import { TIServiceCreateManyOptions, TIServiceUpdateManyOptions, TReadByIdOptions } from "../../common/service/basicService/IService";

@Injectable()
export class ItemService {
	public constructor(
		@InjectModel(Item.name) public readonly model: Model<Item>,
	){
		this.refsInModel = [ModelName.STOCK];
		this.modelName = ModelName.ITEM;
		this.basicService = new BasicService(model);
	}

	public readonly refsInModel: ModelName[];
	public readonly modelName: ModelName;
	private readonly basicService: BasicService;

	/**
	 * Creates an new Item in DB.
	 *
	 * @param item - The Item data to create.
	 * @returns  created Item or an array of service errors if any occurred.
	 */
	async createOne(item: CreateItemDto) {
		return this.basicService.createOne<CreateItemDto, ItemDto>(item);
	}

	/**
	 * Creates many new Items in DB.
	 *
	 * @param items - The Items data to create.
	 * @returns created Item or an array of service errors if any occurred.
	 */
	async createMany(items: CreateItemDto[]) {
		return this.basicService.createMany<CreateItemDto, ItemDto>(items);
	}

	/**
	 * Creates many new Items in DB.
	 *
	 * @deprecated The createMany() method should be used instead
	 * @param items - The Items data to create.
	 * @returns created Item or an array of service errors if any occurred.
	 */
	async createManyWithResponse(items: CreateItemDto[]) {
		return this.basicService.createMany<CreateItemDto, ItemDto>(items);
	}

	/**
	 * Reads an Item by its _id in DB.
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
	 * Reads multiple items from the database based on the provided options.
	 *
	 * @param options - Optional settings for the read operation.
	 * @returns A promise that resolves to a tuple where the first element is an array of ItemDto objects, and the second element is either null or an array of ServiceError objects if something went wrong.
	 */
	async readMany(options?: TIServiceCreateManyOptions) {
		return this.basicService.readMany<ItemDto>(options);
	}

	/**
	 * Updates an Item by its _id in DB. The _id field is read-only and must be found from the parameter
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
	 * Updates multiple items in the database.
	 *
	 * @template T - The type of items to update.
	 * @param items - The items to update.
	 * @param options - Optional settings for the update operation.
	 * @returns A promise that resolves to a tuple where the first element is a boolean indicating if the update was successful, and the second element is either null or an array of ServiceError objects if something went wrong.
	 */
	async updateMany<T = any>(items: T[], options?: TIServiceUpdateManyOptions) {
		return this.basicService.updateMany<T>(items, options);
	}

	/**
	 * Deletes an Item by its _id from DB.
	 *
	 * @param _id - The Mongo _id of the Item to delete.
	 * @returns _true_ if Item was removed successfully, or a ServiceError array if the Item was not found or something else went wrong
	 */
	async deleteOneById(_id: string) {
		return this.basicService.deleteOneById(_id);
	}

	/**
	 * Deletes all Items of the specified by _id Stock from DB.
	 *
	 * @param stock_id - The Mongo _id of the Stock from which all items should be deleted
	 * @returns _true_ if Items was removed successfully, or a ServiceError array if any Items of the Stock was not found or something else went wrong
	 */
	async deleteAllStockItems(stock_id: string) {
		return this.basicService.deleteMany({filter: { stock_id }});
	}

	/**
	 * Deletes all Items of the specified by _id Room from DB.
	 *
	 * @param room_id - The Mongo _id of the Stock from which all items should be deleted
	 * @returns _true_ if Items was removed successfully, or a ServiceError array if any Items of the Room was not found or something else went wrong
	 */
	async deleteAllRoomItems(room_id: string) {
		return this.basicService.deleteMany({filter: { room_id }});
	}
}
