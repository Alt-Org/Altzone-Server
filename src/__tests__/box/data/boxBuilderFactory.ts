import BoxBuilder from "./box/BoxBuilder";
import CreateBoxDtoBuilder from "./box/CreateBoxDtoBuilder";
import UpdateBoxDtoBuilder from "./box/UpdateBoxDtoBuilder";
import GroupAdminBuilder from "./groupAdmin/GroupAdminBuilder";


type BuilderName =
    'Box' | 'CreateBoxDto' | 'UpdateBoxDto' |
    'GroupAdmin';

type BuilderMap = {
    Box: BoxBuilder,
    CreateBoxDto: CreateBoxDtoBuilder,
    UpdateBoxDto: UpdateBoxDtoBuilder,
    GroupAdmin: GroupAdminBuilder
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
            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}