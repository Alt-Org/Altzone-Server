import FriendlistDtoBuilder from "./builder/FriendlistDtoBuilder";
import FriendRequestDtoBuilder from "./builder/FriendRequestDtoBuilder";
import FriendshipBuilder from "./builder/FriendshipBuilder";

type BuilderName =
    | 'FriendlistDto'
    | 'FriendRequestDto'
    | 'Friendship';

type BuilderMap = {
    FriendlistDto: FriendlistDtoBuilder;
    FriendRequestDto: FriendRequestDtoBuilder;
    Friendship: FriendshipBuilder;
};

export default class FriendshipBuilderFactory {
    static getBuilder<T extends BuilderName>(builderName: T): BuilderMap[T] {
        switch (builderName) {
            case 'FriendlistDto':
                return new FriendlistDtoBuilder() as BuilderMap[T];

            case 'FriendRequestDto':
                return new FriendRequestDtoBuilder() as BuilderMap[T];

            case 'Friendship':
                return new FriendshipBuilder() as BuilderMap[T];

            default:
                throw new Error(`Unknown builder name: ${builderName}`);
        }
    }
}