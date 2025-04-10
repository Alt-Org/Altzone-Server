/**
 * Defines clan basic rights from which clan roles are built
 */
export enum ClanBasicRight {
  /**
   * Change items location in the soul home rooms
   */
  EDIT_SOULHOME = 'edit_soulhome',

  /**
   * Change clan data
   */
  EDIT_CLAN_DATA = 'edit_clan_data',

  /**
   * Add and remove any basic right of any clan member except for clan leaders. As well as change a role of any clan member.
   */
  EDIT_MEMBER_RIGHTS = 'edit_member_rights',

  /**
   * Create, update, delete any of the custom roles except default roles
   */
  MANAGE_ROLE = 'manage_role',

  /**
   * Buy / sell an item on the flea market or buy an item in clan shop.
   * Notice that this is not a right for bypassing voting when buying or selling an item
   */
  SHOP = 'shop',
}
