import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FleaMarketItem, publicReferences } from "./fleaMarketItem.schema";
import BasicService from "../common/service/basicService/BasicService";
import { Model } from "mongoose";
import {
	TIServiceReadManyOptions,
	TReadByIdOptions,
} from "../common/service/basicService/IService";
import { FleaMarketItemDto } from "./dto/fleaMarketItem.dto";

@Injectable()
export class FleaMarketService {
	constructor(
		@InjectModel(FleaMarketItem.name)
		public readonly model: Model<FleaMarketItem>
	) {
		this.basicService = new BasicService(model);
	}

	public readonly basicService: BasicService;

	/**
	 * Reads an Item by its _id in DB.
	 *
	 * @param _id - The mongo _id of the item to read.
	 * @param options - Options for reading the item.
	 * @returns A promise that resolves into an item with the given _id or array of service errors.
	 */
	async readOneById(_id: string, options?: TReadByIdOptions) {
		let optionsToApply = options;
		if (optionsToApply?.includeRefs)
			optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
				publicReferences.includes(ref)
			);
		return this.basicService.readOneById<FleaMarketItemDto>(
			_id,
			optionsToApply
		);
	}

	/**
	 * Reads multiple items from the database with the given options.
	 *
	 * @param options - Optional settings for the read operation.
	 * @returns A promise that resolves into an array of found objects or service errors.
	 */
	async readMany(options?: TIServiceReadManyOptions) {
		return this.basicService.readMany<FleaMarketItemDto>(options);
	}
}
