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
import {SystemAdminService} from "../common/apiState/systemAdmin.service";
import {systemAdminRules} from "./rule/systemAdminRules";
import {CharacterClassDto} from "../characterClass/dto/characterClass.dto";
import {UpdateCharacterClassDto} from "../characterClass/dto/updateCharacterClass.dto";
import {characterClassRules} from "./rule/characterClassRules";
import { FurnitureDto } from "src/furniture/dto/furniture.dto";
import { UpdateFurnitureDto } from "src/furniture/dto/updateFurniture.dto";
import { furnitureRules } from "./rule/furnitureRules";
import { RaidRoomDto } from "src/raidRoom/dto/raidRoom.dto";
import { UpdateRaidRoomDto } from "src/raidRoom/dto/updateRaidRoom.dto";
import { raidRoomRules } from "./rule/raidRoomRules";
import { clanRules } from "./rule/clanRules";
import { ClanDto } from "src/clan/dto/clan.dto";
import { UpdateClanDto } from "src/clan/dto/updateClan.dto";
import {SupportedAction} from "./authorization.interceptor";
import {ClanMetaDto} from "../metaData/clan/dto/clanMeta.dto";
import {metaDataRules} from "./rule/metaDataRules";

export type AllowedAction = Action.create_request | Action.read_request | Action.read_response | Action.update_request | Action.delete_request;

export type AllowedSubject =
    typeof ProfileDto | typeof UpdateProfileDto |
    typeof PlayerDto | typeof UpdatePlayerDto |
    typeof CustomCharacterDto | typeof UpdateCustomCharacterDto |
    typeof CharacterClassDto | typeof UpdateCharacterClassDto |
    typeof FurnitureDto | typeof UpdateFurnitureDto | 
    typeof RaidRoomDto | typeof UpdateRaidRoomDto |
    typeof ClanDto | typeof UpdateClanDto |
    typeof ClanMetaDto;

type Subjects = InferSubjects<AllowedSubject>;

export type AppAbility = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

@Injectable()
export class CASLAbilityFactory {
    public constructor(
        private readonly requestHelperService: RequestHelperService,
        private readonly systemAdminService: SystemAdminService
    ) {
    }
    public createForUser = async (user: User, subject: AllowedSubject, action: SupportedAction, subjectObj: AllowedSubject = undefined): Promise<AppAbility> => {
        const isSystemAdmin = await this.systemAdminService.isSystemAdmin(user.profile_id);
        if(isSystemAdmin)
            return systemAdminRules();

        if(subject === ProfileDto || subject === UpdateProfileDto)
            return profileRules(user, subject, action, subjectObj);

        if(subject === PlayerDto || subject === UpdatePlayerDto)
            return playerRules(user, subject, action, subjectObj, this.requestHelperService);

        if(subject === CustomCharacterDto || subject === UpdateCustomCharacterDto)
            return customCharacterRules(user, subject, action, subjectObj, this.requestHelperService);

        if(subject === CharacterClassDto || subject === UpdateCharacterClassDto)
            return characterClassRules(user, subject, action, subjectObj);

        if(subject === FurnitureDto || subject === UpdateFurnitureDto)
            return furnitureRules(user, subject, action, subjectObj, this.requestHelperService);

        if(subject === RaidRoomDto || subject === UpdateRaidRoomDto)
            return raidRoomRules(user, subject, action, subjectObj, this.requestHelperService);

        if(subject === ClanDto || subject === UpdateClanDto)
            return clanRules(user, subject, action, subjectObj, this.requestHelperService);

        if(subject === ClanMetaDto)
            return metaDataRules(user, subject, action, subjectObj);
    }
}
