import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetterAsync} from "../type/rulesSetter.type";
import {ClanDto} from "../../clan/dto/clan.dto";
import {FurnitureDto} from "src/furniture/dto/furniture.dto";
import {UpdateFurnitureDto} from "src/furniture/dto/updateFurniture.dto";
import {ModelName} from "src/common/enum/modelName.enum";
import {MongooseError} from "mongoose";
import {NotFoundException} from "@nestjs/common";
import {getClan_id} from "../util/getClan_id";

type Subjects = InferSubjects<typeof FurnitureDto | typeof UpdateFurnitureDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const furnitureRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj: any, requestHelperService) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(action === Action.create || action === Action.read){
        const clan_id = await getClan_id(user, requestHelperService);

        if(clan_id){
            can(Action.create_request, subject, {clan_id: clan_id});

            //const publicFields = ['_id', 'name', 'uniqueIdentifier'];
            can(Action.read_request, subject);
            can(Action.read_response, subject, {clan_id: clan_id});
        }
    }

    if(action === Action.update || action === Action.delete){
        const furniture = await requestHelperService.getModelInstanceById(ModelName.ITEM, subjectObj._id, FurnitureDto);
        if(!furniture || furniture instanceof MongooseError)
            throw new NotFoundException('The furniture with that _id is not found');

        const clan = await requestHelperService.getModelInstanceById(ModelName.CLAN, furniture.clan_id, ClanDto);
        if(!clan || clan instanceof MongooseError)
            throw new NotFoundException('The clan with that _id is not found. Can not check is the logged-in user clan admin');

        const isClanAdmin = clan.admin_ids.includes(user.player_id);
        if(isClanAdmin){
            can(Action.update_request, subject);
            can(Action.delete_request, subject);
        }
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}