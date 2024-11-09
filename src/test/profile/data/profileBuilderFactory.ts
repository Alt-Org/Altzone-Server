import UpdateProfileDtoBuilder from "./profile/updateProfileDtoBuilder";
import CreateProfileDtoBuilder from "./profile/createProfileDtoBuilder";
import ProfileDtoBuilder from "./profile/profileDtoBuilder";
import ProfileBuilder from "./profile/profileBuilder";

type BuilderName =
    'CreateProfileDto' | 'ProfileDto' | 'UpdateProfileDto' |
    'Profile';

type BuilderMap = {
    CreateProfileDto: CreateProfileDtoBuilder,
    ProfileDto: ProfileDtoBuilder,
    UpdateProfileDto: UpdateProfileDtoBuilder,
    Profile: ProfileBuilder
};

export default class ProfileBuilderFactory {
    static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
        switch (builderName) {
            case 'CreateProfileDto':
                return new CreateProfileDtoBuilder() as BuilderMap[T];
            case 'ProfileDto':
                return new ProfileDtoBuilder() as BuilderMap[T];
            case 'UpdateProfileDto':
                return new UpdateProfileDtoBuilder() as BuilderMap[T];
            case 'Profile':
                return new ProfileBuilder() as BuilderMap[T];
            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}