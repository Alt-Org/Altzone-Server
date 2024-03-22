import { AbilityBuilder, ExtractSubjectType, InferSubjects, MongoAbility, createMongoAbility } from "@casl/ability";
import { AllowedAction } from "../caslAbility.factory";
import { Action } from "../enum/action.enum";
import { RulesSetterAsync } from "../type/RulesSetter.type";
import { ClanDto } from "../../clan/dto/clan.dto";
import { ModelName } from "../../common/enum/modelName.enum";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { getClan_id } from "../util/getClan_id";
import { MongooseError } from "mongoose";
import { ItemShopDto } from "src/shop/itemShop/dto/itemshop.dto";
import { ItemShopDocument } from "src/shop/itemShop/itemShop.schema";
import { ShopItemDTO } from "src/shop/itemShop/dto/shopItem.dto";

type Subjects = InferSubjects<typeof ItemShopDto | typeof ShopItemDTO>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;
export const shopRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subjectObj: any, requestHelperService) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);
    if (action === Action.read) {
        can(Action.read_request, subject);
        can(Action.read_response, subject);
    }
    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}

