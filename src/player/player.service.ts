import {BadRequestException, Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Player} from "./player.schema";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {CustomCharacterService} from "../customCharacter/customCharacter.service";
import {RaidRoomService} from "../raidRoom/raidRoom.service";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {ClanDto} from "../clan/dto/clan.dto";

@Injectable()
@AddBasicService()
export class PlayerService extends BasicServiceDummyAbstract implements IBasicService{
    public constructor(
        @InjectModel(Player.name) public readonly model: Model<Player>,
        private readonly customCharacterService: CustomCharacterService,
        private readonly raidRoomService: RaidRoomService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.CLAN, ModelName.CUSTOM_CHARACTER, ModelName.RAID_ROOM];
    }

    public readonly refsInModel: ModelName[];

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const isClanRefCleanSuccess = await this.clearClanReferences(_id.toString());
        if(isClanRefCleanSuccess instanceof Error)
            throw new BadRequestException(isClanRefCleanSuccess.message);
        await this.customCharacterService.deleteByCondition({player_id: _id});
        await this.raidRoomService.deleteByCondition({player_id: _id}, {isOne: true});
    }

    private clearClanReferences = async (_id: string): Promise<boolean | Error> => {
        const clansWithPlayerAsAdmin: ClanDto[] = await this.requestHelperService.getModelInstanceByCondition(
            ModelName.CLAN,
            {admin_ids: {$in: [_id]}},
            ClanDto
        );

        if(clansWithPlayerAsAdmin && clansWithPlayerAsAdmin.length > 0){
            //Check that there will be no clans left without admins
            let isLastAdmin = false;
            let clan_idLastAdmin: string;
            for(let i=0; i<clansWithPlayerAsAdmin.length; i++){
                const currentClan = clansWithPlayerAsAdmin[i];
                if(currentClan.admin_ids.length === 1){
                    isLastAdmin = true;
                    clan_idLastAdmin = currentClan._id;
                    break;
                }
            }

            if(isLastAdmin){
                return new Error(
                    `Player can not be deleted, because it is the only one admin in clan with _id '${clan_idLastAdmin}'. ` +
                    `Please add another admin to this clan before deleting this Player or delete this clan first.`
                );
            }

            for(let i=0; i<clansWithPlayerAsAdmin.length; i++){
                const currentClan = clansWithPlayerAsAdmin[i];
                const newAdmin_ids = currentClan.admin_ids.filter(value => value !== _id);
                await this.requestHelperService.updateOneById(ModelName.CLAN, currentClan._id, {admin_ids: newAdmin_ids})
            }

            return true;
        }
    }
}