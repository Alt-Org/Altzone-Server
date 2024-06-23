import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetterAsync} from "../type/rulesSetter.type";
import {ModelName} from "src/common/enum/modelName.enum";
import {MongooseError} from "mongoose";
import {NotFoundException} from "@nestjs/common";
import {ItemDto} from "../../item/dto/item.dto";
import {UpdateItemDto} from "../../item/dto/updateItem.dto";

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const itemRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj: any, requestHelperService) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(action === Action.create || action === Action.read){
        can(Action.create_request, subject);

        //const publicFields = ['_id', 'name', 'uniqueIdentifier'];
        can(Action.read_request, subject);
        can(Action.read_response, subject);
    }

    if(action === Action.update || action === Action.delete){
        const item = await requestHelperService.getModelInstanceById(ModelName.ITEM, subjectObj._id, ItemDto);
        if(!item || item instanceof MongooseError)
            throw new NotFoundException('The item with that _id is not found');

        can(Action.update_request, subject);
        can(Action.delete_request, subject);
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}