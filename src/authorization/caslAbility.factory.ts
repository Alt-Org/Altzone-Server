import {AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility} from "@casl/ability";
import {Injectable} from "@nestjs/common";
import {User} from "../auth/user";
import {Action} from "./enum/action.enum";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {ProfileDto} from "../profile/dto/profile.dto";
import {PlayerDto} from "../player/dto/player.dto";
import {UpdateProfileDto} from "../profile/dto/updateProfile.dto";
import {UpdatePlayerDto} from "../player/dto/updatePlayer.dto";
import {CustomCharacterDto} from "../customCharacter/dto/customCharacter.dto";
import {UpdateCustomCharacterDto} from "../customCharacter/dto/updateCustomCharacter.dto";
import {ModelName} from "../common/enum/modelName.enum";

type AllowedAction = Action.create_request | Action.read_request | Action.read_response | Action.update_request | Action.delete_request;

export type AllowedSubject =
    typeof ProfileDto | typeof UpdateProfileDto |
    typeof PlayerDto | typeof UpdatePlayerDto |
    typeof CustomCharacterDto | typeof UpdateCustomCharacterDto;

export type Subjects = InferSubjects<AllowedSubject>;

export type AppAbility = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

@Injectable()
export class CASLAbilityFactory {
    public constructor(private readonly requestHelperService: RequestHelperService) {
    }
    public createForUser = async (user: User, subject: AllowedSubject) => {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

        //TODO: add logic with requesting needed instances based on subject type

        //can(Action.manage, 'all');

        if(subject === ProfileDto){
            can(Action.create_request, subject);

            const publicFields = ['_id', 'username'];
            can(Action.read_request, subject);
            can(Action.read_response, subject, publicFields);
            can(Action.read_response, subject, {_id: user.profile_id});
            can(Action.read_response, subject, {username: user.username});

            can(Action.delete_request, subject, {username: user.username});
        }
        if(subject === UpdateProfileDto){
            can(Action.update_request, subject, {username: user.username});
        }

        if(subject === PlayerDto){
            can(Action.create_request, subject);

            const publicFields = ['_id', 'name', 'uniqueIdentifier'];
            can(Action.read_request, subject);
            can(Action.read_response, subject, publicFields);
            can(Action.read_response, subject, {_id: user.player_id});

            can(Action.delete_request, subject, {_id: user.player_id});
        }
        if(subject === UpdatePlayerDto){
            can(Action.update_request, subject, {_id: user.player_id});
        }

        if(subject === CustomCharacterDto){
            const publicFields = ['_id', 'unityKey', 'name', 'speed', 'resistance', 'resistance', 'defence', 'player_id'];
            can(Action.create_request, subject, {player_id: user.player_id});

            can(Action.read_request, subject);
            can(Action.read_response, subject, publicFields);
            can(Action.read_response, subject, {player_id: user.player_id});
        }
        if(subject === UpdateCustomCharacterDto){
            const customCharacters = await this.getCustomCharacter(user);
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

    private getCustomCharacter = async (user: User) => {
        return await this.requestHelperService.getModelInstanceByCondition(
            ModelName.CUSTOM_CHARACTER,
            {player_id: user.player_id},
            CustomCharacterDto
        );
    }
}
