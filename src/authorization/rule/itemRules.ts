import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetterAsync} from "../type/rulesSetter.type";
import {ClanDto} from "../../clan/dto/clan.dto";
import {ModelName} from "src/common/enum/modelName.enum";
import {MongooseError} from "mongoose";
import {NotFoundException} from "@nestjs/common";
import {getClan_id} from "../util/getClan_id";
import {ItemDto} from "../../item/dto/item.dto";
import {UpdateItemDto} from "../../item/dto/updateItem.dto";

type Subjects = InferSubjects<typeof ItemDto | typeof UpdateItemDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const itemRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj: any, requestHelperService) => {
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
        const furniture = await requestHelperService.getModelInstanceById(ModelName.ITEM, subjectObj._id, ItemDto);
        if(!furniture || furniture instanceof MongooseError)
            throw new NotFoundException('The item with that _id is not found');
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}