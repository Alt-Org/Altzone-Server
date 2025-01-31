import { InferSubjects, MongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { User } from "../auth/user";
import { Action } from "./enum/action.enum";
import { RequestHelperService } from "../requestHelper/requestHelper.service";
import { ProfileDto } from "../profile/dto/profile.dto";
import { PlayerDto } from "../player/dto/player.dto";
import { UpdateProfileDto } from "../profile/dto/updateProfile.dto";
import { UpdatePlayerDto } from "../player/dto/updatePlayer.dto";
import { CustomCharacterDto } from "../player/customCharacter/dto/customCharacter.dto";
import { UpdateCustomCharacterDto } from "../player/customCharacter/dto/updateCustomCharacter.dto";
import { profileRules } from "./rule/profileRules";
import { playerRules } from "./rule/playerRules";
import { customCharacterRules } from "./rule/customCharacterRules";
import { CharacterClassDto } from "../characterClass/dto/characterClass.dto";
import { UpdateCharacterClassDto } from "../characterClass/dto/updateCharacterClass.dto";
import { characterClassRules } from "./rule/characterClassRules";
import { itemRules } from "./rule/itemRules";
import { stockRules } from "./rule/stockRules";
import { clanRules } from "./rule/clanRules";
import { ClanDto } from "../clan/dto/clan.dto";
import { UpdateClanDto } from "../clan/dto/updateClan.dto";
import { SupportedAction } from "./authorization.interceptor";
import { JoinDto } from "../clan/join/dto/join.dto";
import { JoinResultDto } from "../clan/join/dto/joinResult.dto";
import { joinRules } from "./rule/joinRequestRules";
import { soulHomeRules } from "./rule/soulHomeRules";
import { roomRules } from "./rule/roomRules";
import { shopRules } from "./rule/shopRules";
import { RemovePlayerDTO } from "../clan/join/dto/removePlayer.dto";
import { isType, ObjectType } from "../common/base/decorator/AddType.decorator";
import { PlayerLeaveClanDto } from "../clan/join/dto/playerLeave.dto";
import { ChatDto } from "../chat/dto/chat.dto";
import { UpdateChatDto } from "../chat/dto/updateChat.dto";
import { MessageDto } from "../chat/dto/message.dto";
import { chatRules } from "./rule/chatRules";
import { ItemDto } from "../clanInventory/item/dto/item.dto";
import { UpdateItemDto } from "../clanInventory/item/dto/updateItem.dto";
import { RoomDto } from "../clanInventory/room/dto/room.dto";
import { UpdateRoomDto } from "../clanInventory/room/dto/updateRoom.dto";
import { SoulHomeDto } from "../clanInventory/soulhome/dto/soulhome.dto";
import { UpdateSoulHomeDto } from "../clanInventory/soulhome/dto/updateSoulHome.dto";
import { StockDto } from "../clanInventory/stock/dto/stock.dto";
import { UpdateStockDto } from "../clanInventory/stock/dto/updateStock.dto";

export type AllowedAction = Action.create_request | Action.read_request | Action.read_response | Action.update_request | Action.delete_request;

export type AllowedSubject =
    typeof ProfileDto | typeof UpdateProfileDto |
    typeof PlayerDto | typeof UpdatePlayerDto |
    typeof CustomCharacterDto | typeof UpdateCustomCharacterDto |
    typeof CharacterClassDto | typeof UpdateCharacterClassDto |
    typeof ItemDto | typeof UpdateItemDto |
    typeof StockDto | typeof UpdateStockDto |
    typeof ClanDto | typeof UpdateClanDto |
    typeof JoinDto | typeof JoinResultDto | typeof PlayerLeaveClanDto | typeof RemovePlayerDTO |
    typeof SoulHomeDto | typeof UpdateSoulHomeDto |
    typeof RoomDto | typeof UpdateRoomDto |
    typeof ChatDto | typeof UpdateChatDto | typeof MessageDto;


type Subjects = InferSubjects<AllowedSubject>;

export type AppAbility = MongoAbility<[AllowedAction | Action.manage, Subjects | 'all']>;

/**
 * This class is a factory for returning appropriate rules for specified subjects and actions.
 *
 * In case some new file with rules is created it should be registered here in order to work with \@Authorize() decorator as follows: 
 * - Create a new rule 
 * - Add the subject(s) type to the AllowedSubject type above
 * - Add new if statement in the createForUser()
 */
@Injectable()
export class CASLAbilityFactory {
    public constructor(
        private readonly requestHelperService: RequestHelperService
    ) {
    }
    public createForUser = async (user: User, subject: AllowedSubject, action: SupportedAction, subjectObj: AllowedSubject = undefined): Promise<AppAbility> => {

        const obj = new subject() as unknown as ObjectType;

        if (isType(obj, 'ProfileDto') || isType(obj, 'UpdateProfileDto'))
            return profileRules(user, subject, action, subjectObj);
      
        if (isType(obj, 'PlayerDto') || isType(obj, 'UpdatePlayerDto'))
            return playerRules(user, subject, action, subjectObj, this.requestHelperService);

        if (isType(obj, 'CustomCharacterDto') || isType(obj, 'UpdateCustomCharacterDto'))
            return customCharacterRules(user, subject, action, subjectObj, this.requestHelperService);
      
        if (obj instanceof CharacterClassDto || isType(obj, 'CharacterClassDto') || isType(obj, 'UpdateCharacterClassDto'))
            return characterClassRules(user, subject, action, subjectObj);
 
        if (isType(obj, 'ItemDto') || isType(obj, 'UpdateItemDto'))
            return itemRules(user, subject, action, subjectObj, this.requestHelperService);
  
        if (isType(obj, 'StockDto') || isType(obj, 'UpdateStockDto'))
            return stockRules(user, subject, action, subjectObj, this.requestHelperService);
        
        if (isType(obj, 'ClanDto') || isType(obj, 'UpdateClanDto'))
            return clanRules(user, subject, action, subjectObj, this.requestHelperService);

        if (isType(obj, 'JoinDto') || isType(obj, 'JoinResultDto') || isType(obj, 'PlayerLeaveClan') || isType(obj, 'RemovePlayerDTO'))
            return joinRules(user, subject, action, subjectObj, this.requestHelperService);

        if (isType(obj, 'SoulHomeDto') || isType(obj, 'updateSoulHomeDto'))
            return soulHomeRules(user, subject, action, subjectObj, this.requestHelperService)

        if (isType(obj, 'RoomDto') || isType(obj, 'UpdateRoomDto'))
            return roomRules(user, subject, action, subjectObj, this.requestHelperService);

        if (isType(obj, 'ItemShopDto') || isType(obj, 'ShopItemDTO'))
            return shopRules(user, subject, action, subjectObj, this.requestHelperService)

        if (isType(obj, 'ChatDto') || isType(obj, 'UpdateChatDto') || isType(obj, 'MessageDto'))
            return chatRules(user, subject, action, subjectObj, this.requestHelperService);
    }
}

