import CreateCustomCharacterDtoBuilder from "./customCharacter/CreateCustomCharacterDtoBuilder";
import CustomCharacterBuilder from "./customCharacter/CustomCharacterBuilder";
import UpdateCustomCharacterDtoBuilder from "./customCharacter/UpdateCustomCharacterDtoBuilder";

type BuilderName = 
    'CreateCustomCharacterDto' | 'CustomCharacter' | 'UpdateCustomCharacterDto';

type BuilderMap = {
    CreateCustomCharacterDto: CreateCustomCharacterDtoBuilder,
    CustomCharacter: CustomCharacterBuilder,
    UpdateCustomCharacterDto: UpdateCustomCharacterDtoBuilder
};

export default class CustomCharacterBuilderFactory {
    static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
        switch (builderName) {
            case 'CreateCustomCharacterDto':
                return new CreateCustomCharacterDtoBuilder() as BuilderMap[T];
            case 'CustomCharacter':
                return new CustomCharacterBuilder() as BuilderMap[T];
            case 'UpdateCustomCharacterDto':
                return new UpdateCustomCharacterDtoBuilder() as BuilderMap[T];
            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}