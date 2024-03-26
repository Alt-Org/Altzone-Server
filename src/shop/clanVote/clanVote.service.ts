import { InjectModel } from "@nestjs/mongoose";
import { ClanVote } from "./clanVote.schema";
import { Model, MongooseError, Types } from "mongoose";
import { RequestHelperService } from "src/requestHelper/requestHelper.service";
import { ModelName } from "src/common/enum/modelName.enum";
import { AddBasicService, ClearCollectionReferences } from "src/common/base/decorator/AddBasicService.decorator";
import { IgnoreReferencesType } from "src/common/type/ignoreReferences.type";
import { IBasicService } from "src/common/base/interface/IBasicService";
import { BasicServiceDummyAbstract } from "src/common/base/abstract/basicServiceDummy.abstract";
import { BadRequestException, Body, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { IHookImplementer, PostCreateHookFunction, PostHookFunction, PostReadAllHookFunction, PostReadOneHookFunction, PreHookFunction } from "src/common/interface/IHookImplementer";
import { UpdateClanVoteDto } from "./dto/updateClanVote.dto";
import { passed } from "src/common/function/timeUtils";
import { ItemDto } from "src/item/dto/item.dto";
import { ItemShopDto } from "../itemShop/dto/itemshop.dto";
import { ShopItemDTO } from "../itemShop/dto/shopItem.dto";
import { StockDto } from "src/stock/dto/stock.dto";
import { CreateClanVoteDto } from "./dto/createClanVote.dto";
import { ItemShopService } from "../itemShop/itemshop.service";
import { check } from "express-validator";
import { ShopItem } from "../itemShop/itemShop.schema";
import { IResponseShape } from "src/common/interface/IResponseShape";
@Injectable()
@AddBasicService()
export class ClanVoteService extends BasicServiceDummyAbstract<ClanVote> implements IBasicService<ClanVote>, IHookImplementer {
    public constructor(
        @InjectModel(ClanVote.name) public readonly model: Model<ClanVote>,
        private readonly requestHelperService: RequestHelperService,
        private readonly shopService: ItemShopService,
    ) {
        super();
        this.refsInModel = [ModelName.ITEM, ModelName.ITEMSHOP];
        this.modelName = ModelName.CLANVOTE;
    }
    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    public createWithChecks = async (body: CreateClanVoteDto, request: Request) => {
        const items = await this.getShopItems(body.shop_id);
        const item = await this.requestHelperService.getModelInstanceById(ModelName.ITEM, body.itemToBuy_id, ItemDto);

        if (!item || item instanceof MongooseError)
            throw new NotFoundException('No item with that _id not found'); // added this check because if index is -1 it returns index 0. thanks javascript!

        const predicate = (e: ShopItemDTO) => e.item_id === body.itemToBuy_id; 
        const i = items.findIndex(predicate);
        const itemToSell = items[i];
        if (itemToSell.isSold || itemToSell.isInVoting)
            throw new BadRequestException("The Item you are trying to buy has already been sold or, is already in voting by another clan");
        return this.createOne(body);
    }
    public readAllPostHook: PostReadAllHookFunction = async (output: ClanVote[]): Promise<boolean> => {
        if (!output)
            return true;
        return this.voteCheck(output);
    }

    public updateOnePostHook: PostHookFunction = async (input: Partial<UpdateClanVoteDto>, oldDoc: ClanVote): Promise<boolean> => {
        if (!oldDoc)
            return true;
        if (passed(oldDoc.startingTime, oldDoc.votingTime)) {
            await this.resolveVote(oldDoc);
        }
        return true;
    }
    public getShopItems = async (shop_id): Promise<Array<ShopItemDTO>> => {
        const shopReq = await this.shopService.readOneById(shop_id);
        if (!shopReq || shopReq instanceof MongooseError)
            throw new NotFoundException('No shop with that _id not found');
        const shop = shopReq.data[shopReq.metaData.dataKey];
        const items = shop.items;
        return items;
    }
    public createOnePostHook: PostCreateHookFunction = async (input: CreateClanVoteDto, output: ClanVote): Promise<boolean> => {
        if (!output.shop_id)
            return true;
        const items = await this.getShopItems(output.shop_id);
        const predicate = (e: ShopItemDTO) => e.item_id === output.itemToBuy_id;
        const i = items.findIndex(predicate);
        items[i].isInVoting = true;
        items[i].vote_id = output._id;
        output.startingTime = Date.now();
        await this.updateOneById(output);
        const r = await this.requestHelperService.updateOneById(ModelName.ITEMSHOP, output.shop_id, { items: items })
        return true;
    }

    public readOnePostHook: PostReadOneHookFunction = async (output: ClanVote): Promise<boolean> => {
        if (!output)
            return true;

        if (passed(output.startingTime, output.votingTime))
            await this.resolveVote(output);

        return true;
    }
    public voteCheck = async (vote: ClanVote[]) => {
        let len = vote.length;
        for (let i = 0; i < len; i++) {
            const p = vote[i];
            if (passed(p.startingTime, p.votingTime))
                await this.resolveVote(p);
        }
        return true;
    };


    public resolveVote = async (vote: ClanVote) => {
        const item = await this.requestHelperService.getModelInstanceById(ModelName.ITEM, vote.itemToBuy_id, ItemDto);
        if (!item || item instanceof MongooseError)
            throw new NotFoundException('No item with that _id not found');

        const shopReq = await this.shopService.readOneById(vote.shop_id);
        if (!shopReq || shopReq instanceof MongooseError)
            throw new NotFoundException('No shop with that _id not found');

        const stock = await this.requestHelperService.getModelInstanceByCondition(ModelName.STOCK, { clan_id: vote.clan_id }, StockDto, true);
        if (!stock || stock instanceof MongooseError)
            throw new NotFoundException('No stock with that clan_id not found');

        //rewrite this to work with clan settings once they are implemented            
        const shop = shopReq.data[shopReq.metaData.dataKey];
        let items: ShopItem[] = shop.items;

        const predicate = (e: ShopItem) => e.item_id === item._id;
        const i = items.findIndex(predicate);

        const totalvotes = vote.negativeVotes + vote.positiveVotes;
        const result = 0.6 <= vote.positiveVotes / totalvotes;

        items[i].isInVoting = false;
        items[i].isSold = result;

        if (result) {
            await this.requestHelperService.updateOneById(ModelName.ITEM, item._id, { stock_id: stock._id })
            await this.requestHelperService.updateOneById(ModelName.ITEM, item._id, { isInStock: result });
        }
        items[i].vote_id = undefined;
        await this.requestHelperService.updateOneById(ModelName.ITEMSHOP, vote.shop_id, { items: items })
        await this.deleteOneById(vote._id);
    }


    public handleUpdate = async (body: UpdateClanVoteDto) => {
        const voteToUpdate = await this.readOneById(body._id);
        if (!voteToUpdate || voteToUpdate instanceof MongooseError)
            throw new NotFoundException('No vote with that _id not found');

        const votedPlayers: string[] = voteToUpdate.data[voteToUpdate.metaData.dataKey].votedPlayers;

        if (votedPlayers.includes(body.player_id))
            throw new ForbiddenException("Player already voted");

        votedPlayers.push(body.player_id);
        body["votedPlayers"] = votedPlayers;
        if (body.vote) {
            body["positiveVotes"] = voteToUpdate.data[voteToUpdate.metaData.dataKey].positiveVotes + 1;
        } else {
            body["negativeVotes"] = voteToUpdate.data[voteToUpdate.metaData.dataKey].negativeVotes + 1;
        }
        return await this.updateOneById(body);
    }

    public clearCollectionReferences: ClearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {

    }
}