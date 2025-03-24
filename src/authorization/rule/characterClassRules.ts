import {AllowedAction} from "../caslAbility.factory";
import {AbilityBuilder, createMongoAbility, ExtractSubjectType} from "@casl/ability";
import {Action} from "../enum/action.enum";
import {InferSubjects, MongoAbility} from "@casl/ability/dist/types";
import {RulesSetterAsync} from "../type/RulesSetter.type";

type Subjects = InferSubjects<any>;
type Ability = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

//This is a rule set for the character class subject.
//Notice that it will get logged-in user from caslAbilityFactory
export const characterClassRules: RulesSetterAsync<Ability, Subjects> = async (user, subject: any, action) => {
    //Get can method from CASL library, which specify what actions are allowed
    const { can, build } = new AbilityBuilder<Ability>(createMongoAbility);

    //If user wants to create a CharacterClass
    if(action === Action.create){
        //Allow to create CharacterClass only if CharacterClass speed is equal to 23
        //Notice that usually you want to use the user object to check the permissions 
        //and you can also make some additional DB requests here to check something
        can(Action.create_request, subject, { speed: 23 });

        //OR allow to create CharacterClass if CharacterClass resistance is 10 and attack is 1
        can(Action.create_request, subject, { resistance: 10, attack: 1 });
    }

    if(action === Action.read){
        //Allow to request data
        can(Action.read_request, subject);
        //Allow to send data to client
        can(Action.read_response, subject);
    }

    //Anybody can update and delete the CharacterClass
    can(Action.update_request, subject);
    can(Action.delete_request, subject);

    //In the end build the specified above permissions
    return build({
        detectSubjectType: (item) =>
            item.constructor as ExtractSubjectType<Subjects>,
    });
}