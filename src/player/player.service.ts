import {BadRequestException, Injectable} from "@nestjs/common";
import {Model, MongooseError, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Player} from "./player.schema";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {CustomCharacterService} from "../customCharacter/customCharacter.service";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {ClanDto} from "../clan/dto/clan.dto";
import {IHookImplementer, PostHookFunction} from "../common/interface/IHookImplementer";
import {UpdatePlayerDto} from "./dto/updatePlayer.dto";
import BasicService from "src/common/service/basicService/BasicService";
import { IResponseShape } from "src/common/interface/IResponseShape";
import { TReadByIdOptions } from "src/common/service/basicService/IService";
import { PlayerDto } from "./dto/player.dto";

@Injectable()
@AddBasicService()
export class PlayerService
    extends BasicServiceDummyAbstract
    implements IBasicService, IHookImplementer{
    public constructor(
        @InjectModel(Player.name) public readonly model: Model<Player>,
        private readonly customCharacterService: CustomCharacterService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.basicService = new BasicService(model);
        this.refsInModel = [ModelName.CLAN, ModelName.CUSTOM_CHARACTER, ModelName.ROOM];
        this.modelName = ModelName.PLAYER;
    }

    public readonly refsInModel: ModelName[];
    public readonly modelName: ModelName;
    private readonly basicService: BasicService;

    async getPlayerById(_id: string, options?: TReadByIdOptions) {
        let optionsToApply = options;
        if (options?.includeRefs) {
            optionsToApply.includeRefs = options.includeRefs.filter((ref) => this.refsInModel.includes(ref));
        }
        return this.basicService.readOneById<PlayerDto>(_id, optionsToApply);
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const isClanRefCleanSuccess = await this.clearClanReferences(_id.toString());
        if(isClanRefCleanSuccess instanceof Error)
            throw new BadRequestException(isClanRefCleanSuccess.message);
        await this.customCharacterService.deleteByCondition({player_id: _id});
    }

    public updateOnePostHook: PostHookFunction = async (input: Partial<UpdatePlayerDto>, oldDoc: Partial<Player>, output: Partial<Player>): Promise<boolean> => {
        if(!input?.clan_id)
            return true;

        const changeCounterValue = this.requestHelperService.changeCounterValue;

        //decrease playerCounter from old clan
        const clanRemoveFrom_id = oldDoc.clan_id;
        if(clanRemoveFrom_id)
            await changeCounterValue(ModelName.CLAN, {_id: clanRemoveFrom_id}, 'playerCount', -1);

        const isPlayerCountIncreased = await changeCounterValue(ModelName.CLAN, {_id: input.clan_id}, 'playerCount', 1);

        return isPlayerCountIncreased;
    }

    public deleteOnePostHook: PostHookFunction = async (input: any, oldDoc: Partial<Player>, output: Partial<Player>): Promise<boolean> => {
        const clan_id = oldDoc.clan_id;

        if(!clan_id)
            return true;

        const isPlayerCountDecreased = await this.requestHelperService.changeCounterValue(ModelName.CLAN, {_id: clan_id}, 'playerCount', -1);

        return isPlayerCountDecreased;
    }

    private clearClanReferences = async (_id: string): Promise<boolean | Error> => {
        const clansWithPlayerAsAdmin = await this.requestHelperService.getModelInstanceByCondition(
            ModelName.CLAN,
            {admin_ids: {$in: [_id]}},
            ClanDto
        );

        if(!clansWithPlayerAsAdmin || clansWithPlayerAsAdmin.length === 0)
            return true;

        //Check that there will be no clans left without admins
        let isLastAdminNonEmptyClan = false;
        let clan_idLastAdmin: string;
        for(let i=0; i<clansWithPlayerAsAdmin.length; i++){
            const currentClan = clansWithPlayerAsAdmin[i];
            if(currentClan.admin_ids.length === 1){
                const clanPlayers = await this.requestHelperService.count(ModelName.PLAYER, {clan_id: currentClan._id});
                isLastAdminNonEmptyClan = clanPlayers > 1;
                clan_idLastAdmin = currentClan._id;
                break;
            }
        }

        if(isLastAdminNonEmptyClan)
            return new Error(
                `Player can not be deleted, because it is the only one admin in a non empty clan with _id '${clan_idLastAdmin}'. ` +
                `Please add another admin to this clan before deleting this Player or delete this clan first.`
            );

        for(let i=0; i<clansWithPlayerAsAdmin.length; i++){
            const currentClan = clansWithPlayerAsAdmin[i];
            const newAdmin_ids = currentClan.admin_ids.filter(value => value !== _id);
            await this.requestHelperService.updateOneById(ModelName.CLAN, currentClan._id, {admin_ids: newAdmin_ids})
        }

        return true;
    }
}