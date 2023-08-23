import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {User} from "../../auth/user";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {CustomCharacterDto} from "../../customCharacter/dto/customCharacter.dto";
import {RequestHelperService} from "../../requestHelper/requestHelper.service";
import {ModelName} from "../../common/enum/modelName.enum";
import {RulesSetterAsync} from "../type/RulesSetter.type";
import {CharacterClassDto} from "../../characterClass/dto/characterClass.dto";
import {UpdateCharacterClassDto} from "../../characterClass/dto/updateCharacterClass.dto";

type Subjects = InferSubjects<typeof CharacterClassDto | typeof UpdateCharacterClassDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const characterClassRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action, subject_id) => {
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(action === Action.read){
        can(Action.read_request, subject);
        can(Action.read_response, subject);
    }

    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}

const getCustomCharacter = async (user: User, requestHelperService: RequestHelperService) => {
    return await requestHelperService.getModelInstanceByCondition(
        ModelName.CUSTOM_CHARACTER,
        {player_id: user.player_id},
        CustomCharacterDto
    );
}