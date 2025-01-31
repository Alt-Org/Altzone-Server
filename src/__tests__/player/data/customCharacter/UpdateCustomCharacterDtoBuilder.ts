import {UpdateCustomCharacterDto} from "../../../../player/customCharacter/dto/updateCustomCharacter.dto";
import {ObjectId} from "mongodb";
import {CharacterId} from "../../../../player/customCharacter/enum/characterId.enum";

export default class UpdateCustomCharacterDtoBuilder {
    private readonly base: UpdateCustomCharacterDto = {
        _id: undefined,
        characterId: undefined,
        speed: undefined,
        size: undefined,
        attack: undefined,
        defence: undefined,
        hp: undefined,
        level: undefined
    };

    build(): UpdateCustomCharacterDto {
        return { ...this.base } as UpdateCustomCharacterDto;
    }

    setId(_id: string | ObjectId) {
        this.base._id = _id as any;
        return this;
    }

    setCharacterId(characterId: CharacterId) {
        this.base.characterId = characterId;
        return this;
    }

    setSpeed(speed: number) {
        this.base.speed = speed;
        return this;
    }

    setSize(size: number) {
        this.base.size = size;
        return this;
    }

    setAttack(attack: number) {
        this.base.attack = attack;
        return this;
    }

    setDefence(defence: number) {
        this.base.defence = defence;
        return this;
    }

    setHp(hp: number) {
        this.base.hp = hp;
        return this;
    }

    setLevel(level: number) {
        this.base.level = level;
        return this;
    }
}