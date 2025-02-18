import BoxBuilder from "./box/BoxBuilder";
import CreateBoxDtoBuilder from "./box/CreateBoxDtoBuilder";
import UpdateBoxDtoBuilder from "./box/UpdateBoxDtoBuilder";
import GroupAdminBuilder from "./groupAdmin/GroupAdminBuilder";
import TesterBuilder from "./box/TesterBuilder";


type BuilderName =
    'Box' | 'CreateBoxDto' | 'UpdateBoxDto' |
    'GroupAdmin' | 'Tester';

type BuilderMap = {
    Box: BoxBuilder,
    CreateBoxDto: CreateBoxDtoBuilder,
    UpdateBoxDto: UpdateBoxDtoBuilder,
    GroupAdmin: GroupAdminBuilder,
    Tester: TesterBuilder
};

export default class BoxBuilderFactory {
    static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
        switch (builderName) {
            case 'Box':
                return new BoxBuilder() as BuilderMap[T];
            case 'CreateBoxDto':
                return new CreateBoxDtoBuilder() as BuilderMap[T];
            case 'UpdateBoxDto':
                return new UpdateBoxDtoBuilder() as BuilderMap[T];
            case 'GroupAdmin':
                return new GroupAdminBuilder() as BuilderMap[T];
            case 'Tester':
                return new TesterBuilder() as BuilderMap[T];
            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}