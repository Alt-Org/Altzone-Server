import {CreateCustomCharacterDto} from "../../../../player/customCharacter/dto/createCustomCharacter.dto";
import {CharacterId} from "../../../../player/customCharacter/enum/characterId.enum";

export default class CreateCustomCharacterDtoBuilder {
    private readonly base: CreateCustomCharacterDto = {
        characterId: CharacterId.Prankster_202,
        level: 1
    };

    build(): CreateCustomCharacterDto {
        return { ...this.base } as CreateCustomCharacterDto;
    }

    setCharacterId(characterId: CharacterId) {
        this.base.characterId = characterId;
        return this;
    }

    setLevel(level: number) {
        this.base.level = level;
        return this;
    }
}
