import {CustomCharacter} from "../../../../player/customCharacter/customCharacter.schema";
import {ObjectId} from "mongodb";
import {CharacterId} from "../../../../player/customCharacter/enum/characterId.enum";

export default class CustomCharacterBuilder {
    private readonly base: CustomCharacter = {
        characterId: CharacterId.Prankster_202,
        speed: 10,
        size: 10,
        attack: 10,
        defence: 10,
        hp: 100,
        level: 1,
        player_id: undefined
    };

    build(): CustomCharacter {
        return { ...this.base } as CustomCharacter;
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

    setPlayerId(playerId: string | ObjectId) {
        this.base.player_id = playerId as any;
        return this;
    }
}