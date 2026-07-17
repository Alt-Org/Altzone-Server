import { Injectable, forwardRef, Inject, Optional } from '@nestjs/common';
import { Model, ClientSession } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Stock } from './stock.schema';
import { CreateStockDto } from './dto/createStock.dto';
import { UpdateStockDto } from './dto/updateStock.dto';
import { StockDto } from './dto/stock.dto';
import { Player } from '../../player/schemas/player.schema';
import { ItemService } from '../item/item.service';
import { ModelName } from '../../common/enum/modelName.enum';
import BasicService from '../../common/service/basicService/BasicService';
import { FleaMarketService } from '../../fleaMarket/fleaMarket.service';
import {
  TReadByIdOptions,
  TIServiceReadManyOptions,
  TIServiceCreateOneOptions,
  TIServiceDeleteByIdOptions,
} from '../../common/service/basicService/IService';
import ServiceError from '../../common/service/basicService/ServiceError';
import { Environment } from '../../common/enum/environment.enum';
import { SEReason } from '../../common/service/basicService/SEReason';
import { ClanDto } from '../../clan/dto/clan.dto';

@Injectable()
export class StockService {
  public constructor(
    @InjectModel(Stock.name) public readonly model: Model<Stock>,
    @InjectModel(ModelName.PLAYER) private readonly playerModel: Model<Player>,
    private readonly itemService: ItemService,
    @Inject(forwardRef(() => FleaMarketService))
    @Optional()
    private readonly fleaMarketService?: FleaMarketService,
  ) {
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
   * @param options - DB query options.
   * @returns created Stock or an array of service errors if any occurred.
   */
  async createOne(stock: CreateStockDto, options?: TIServiceCreateOneOptions) {
    // allow BasicService to handle null/undefined inputs without throwing errors
    // since the unit test was designed to ensure that createOne handles null/undefined input
    if (!stock) {
      return this.basicService.createOne<CreateStockDto, StockDto>(
        stock,
        options,
      );
    }

    const { clan_id } = stock;

    if (!clan_id) {
      throw new ServiceError({
        reason: SEReason.NOT_FOUND,
        field: 'clan_id',
        message: 'Clan id is required to create a stock',
      });
    }

    const [clan, clanErrors] =
      await this.basicService.readOneById<ClanDto>(clan_id);

    if (!clanErrors && clan) {
      const environment = clan.environment ?? Environment.OPEN_DEMO;
      stock.environment = environment;
    }

    return this.basicService.createOne<CreateStockDto, StockDto>(
      stock,
      options,
    );
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
    if (options?.includeRefs)
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        this.refsInModel.includes(ref),
      );

    const [stock, errors] = await this.basicService.readOneById<StockDto>(
      _id,
      optionsToApply,
    );
    if (errors) return [null, errors];

    const fleaMarketResult = this.fleaMarketService
      ? await this.fleaMarketService.basicService.readMany({
          filter: { clan_id: stock.clan_id },
        })
      : [[]];

    const [fleaMarketItems] = fleaMarketResult || [[]];
    const stockObject =
      typeof stock['toObject'] === 'function' ? stock['toObject']() : stock;

    if (options?.select) return [stockObject, null];

    return [{ ...stockObject, FleaMarketItem: fleaMarketItems ?? [] }, null];
  }

  /**
   * Reads Stocks by specified options from DB.
   *
   * @param options - Options for reading CharacterClasses.
   * @param environment - Environment of the clan that the stocks belong to
   * @returns An array of Stocks if succeed or an array of ServiceErrors if any occurred.
   */
  async readAll(options?: TIServiceReadManyOptions, environment?: Environment) {
    const optionsToApply = { ...(options ?? {}) };

    if (options?.includeRefs) {
      optionsToApply.includeRefs = options.includeRefs.filter((ref) =>
        this.refsInModel.includes(ref),
      );
    }

    optionsToApply.filter = {
      ...(options?.filter ?? {}),
      ...(environment !== undefined ? { environment } : {}),
    };

    return this.basicService.readMany<StockDto>(optionsToApply);
  }

  /**
   * Reads all Stocks of the Clan the Player belongs to.
   *
   * @param player_id Mongo _id of the Player.
   * @param options Options for reading Stocks.
   * @param environment Environment of the stocks.
   * @returns An array of Clan Stocks if succeeded or an array of ServiceErrors if error occurred.
   */
  async readPlayerClanStocks(
    player_id: string,
    options?: TIServiceReadManyOptions,
    environment?: Environment,
  ) {
    const player = await this.playerModel.findById(player_id);

    if (!player) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'player_id',
            value: player_id,
            message: 'Could not find any Player with this _id',
          }),
        ],
      ];
    }

    const { clan_id } = player;
    if (!clan_id) {
      return [
        null,
        [
          new ServiceError({
            reason: SEReason.NOT_FOUND,
            field: 'clan_id',
            value: clan_id,
            message: 'The Player is not in any Clan',
          }),
        ],
      ];
    }

    return this.readAll(
      {
        ...(options ?? {}),
        filter: { ...(options?.filter ?? {}), clan_id },
      },
      environment,
    );
  }

  /**
   * Updates a Stock cellCount field by the specified amount.
   *
   * @param _id - The Mongo _id of the Stock to be updated
   * @param cellCountChange - the amount the cellCount field will be updated on. It can be ever negative or positive number.
   * @returns _true_ if Stock was updated successfully, _false_ if nothing was updated for the Stock,
   * or a ServiceError array if Stock was not found or something else went wrong.
   */
  public updateStockCellCount = async (
    _id: string,
    cellCountChange: number,
  ): Promise<[boolean | null, ServiceError[] | null]> => {
    const [stock, errors] = await this.basicService.readOneById<StockDto>(_id);
    if (errors) return [null, errors];

    const { cellCount } = stock;

    const requestedCellCount = cellCount + cellCountChange;
    const newCellCount = requestedCellCount < 0 ? 0 : requestedCellCount;

    return this.basicService.updateOneById(_id, { cellCount: newCellCount });
  };

  /**
   * Updates a Stock by its _id in DB. The _id field is read-only and must be found from the parameter
   *
   * @param Stock - The data needs to be updated for the Stock.
   * @returns _true_ if Stock was updated successfully, _false_ if nothing was updated for the Stock,
   * or a ServiceError array if Stock was not found or something else went wrong.
   */
  async updateOneById(stock: UpdateStockDto) {
    const { _id, ...fieldsToUpdate } = stock;
    return this.basicService.updateOneById(_id, fieldsToUpdate);
  }

  /**
   * Deletes a Stock its _id from DB.
   *
   * Notice that the method will also delete all Items inside of the Stock.
   *
   * @param _id - The Mongo _id of the Stock to delete.
   * @param options - Optional session for transaction support.
   * @returns _true_ if Stock was removed successfully, or a ServiceError array if the Stock was not found or something else went wrong
   */
  async deleteOneById(_id: string, options?: TIServiceDeleteByIdOptions) {
    await this.itemService.deleteAllStockItems(_id, options);
    return this.basicService.deleteOneById(_id, options);
  }
}
