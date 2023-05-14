import {ClassName} from "../../dictionary";
import ValidatorAbstract from "./../validatorAbstract";
import PlayerDataValidator from "../../../playerData/playerData.validator";
import CharacterClassValidator from "../../../characterClass/characterClass.validator";
import ClanValidator from "../../../clan/clan.validator";
import CustomCharacterValidator from "../../../customCharacter/customCharacter.validator";
import BattleCharacterValidator from "../../../battleCharacter/battleCharacter.validator";
import FurnitureValidator from "../../../furniture/furniture.validator";
import RaidRoomValidator from "../../../raidRoom/raidRoom.validator";

export default class ValidatorFactory{
    public create = (modelName: ClassName): ValidatorAbstract => {
        switch (modelName) {
            case ClassName.CHARACTER_CLASS:
                return new CharacterClassValidator();
            case ClassName.CLAN:
                return new ClanValidator();
            case ClassName.CUSTOM_CHARACTER:
                return new CustomCharacterValidator();
            case ClassName.PLAYER_DATA:
                return new PlayerDataValidator();
            case ClassName.BATTLE_CHARACTER:
                return new BattleCharacterValidator();
            case ClassName.FURNITURE:
                return new FurnitureValidator();
            case ClassName.RAID_ROOM:
                return new RaidRoomValidator();
        }
    }
}