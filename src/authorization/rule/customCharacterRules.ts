import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {User} from "../../auth/user";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {CustomCharacterDto} from "../../customCharacter/dto/customCharacter.dto";
import {UpdateCustomCharacterDto} from "../../customCharacter/dto/updateCustomCharacter.dto";
import {RequestHelperService} from "../../requestHelper/requestHelper.service";
import {ModelName} from "../../common/enum/modelName.enum";
import {RulesSetterAsync} from "../type/RulesSetter.type";

type Subjects = InferSubjects<typeof CustomCharacterDto | typeof UpdateCustomCharacterDto>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

export const customCharacterRules: RulesSetterAsync<Ability, Subjects> = async (user, subject, requestHelperService) => {
    const { can, cannot, build } = new AbilityBuilder<Ability>(createMongoAbility);

    if(subject === CustomCharacterDto){
        const publicFields = ['_id', 'unityKey', 'name', 'speed', 'resistance', 'resistance', 'defence', 'player_id'];
        can(Action.create_request, subject, {player_id: user.player_id});

        can(Action.read_request, subject);
        can(Action.read_response, subject, publicFields);
        can(Action.read_response, subject, {player_id: user.player_id});
    }

    if(subject === UpdateCustomCharacterDto){
        const customCharacters = await getCustomCharacter(user, requestHelperService);
        if(!customCharacters){
            can(Action.update_request, subject);
            can(Action.delete_request, subject);
        } else{
            for(let i=0; i<customCharacters.length; i++){
                can(Action.update_request, subject, {_id: customCharacters[i]._id});
                can(Action.delete_request, subject, {_id: customCharacters[i]._id});
            }
        }
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