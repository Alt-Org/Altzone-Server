/**
 * Enum used to determine class names of the model part of an API.
 *
 * There are different places where it is used, for example:
 * - When creating a collection in DB
 * - When adding references to other collections in DB
 * - When returning data to the client side
 *
 * Notice that whenever there is a need to add a new collection to DB this enum must be updated as well with new collection name.
 *
 * Notice that whenever there is a need to specify model class name or DB collection this enum must be used instead of plain text.
 * @example ```ts
 * // Do not write it as plain text
 * const modelName = 'Clan';
 * //Use the enum instead
 * const modelName = ModelName.CLAN
 *```
 */
export enum ModelName {
    CHARACTER_CLASS = 'CharacterClass',
    CLAN = 'Clan',
    CUSTOM_CHARACTER = 'CustomCharacter',
    PLAYER = 'Player',
    ITEM = 'Item',
    STOCK = 'Stock',
    PROFILE = 'Profile',
    CHAT = 'Chat',
    JOIN = 'Join',
    CLAN_META = 'ClanMeta',
    ROOM = 'Room',
    SOULHOME = 'SoulHome',
    CLANVOTE = 'ClanVote',
    ITEMSHOP = 'ItemShop'
}