import {InferSubjects, MongoAbility} from "@casl/ability";
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
import {profileRules} from "./rule/profileRules";
import {playerRules} from "./rule/playerRules";
import {customCharacterRules} from "./rule/customCharacterRules";

export type AllowedAction = Action.create_request | Action.read_request | Action.read_response | Action.update_request | Action.delete_request;

export type AllowedSubject =
    typeof ProfileDto | typeof UpdateProfileDto |
    typeof PlayerDto | typeof UpdatePlayerDto |
    typeof CustomCharacterDto | typeof UpdateCustomCharacterDto;

type Subjects = InferSubjects<AllowedSubject>;

export type AppAbility = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

@Injectable()
export class CASLAbilityFactory {
    public constructor(private readonly requestHelperService: RequestHelperService) {
    }
    public createForUser = async (user: User, subject: AllowedSubject): Promise<AppAbility> => {
        if(subject === ProfileDto || subject === UpdateProfileDto)
            return profileRules(user, subject);

        if(subject === PlayerDto || subject === UpdatePlayerDto)
            return playerRules(user, subject);

        if(subject === CustomCharacterDto || subject === UpdateCustomCharacterDto)
            return customCharacterRules(user, subject, this.requestHelperService);
    }
}
