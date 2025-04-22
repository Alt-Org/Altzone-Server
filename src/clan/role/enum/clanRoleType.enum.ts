export enum ClanRoleType {
  /**
   * Role, which each clan must have and which is read-only for everybody
   */
  DEFAULT = 'default',

  /**
   * Role, which player can create, update and delete. After such role is created, it can be set to any amount of clan members.
   */
  NAMED = 'named',

  /**
   * Role, which player can create, update and delete for an individual clan member. It is personal and can be set to only one clan member.
   */
  PERSONAL = 'personal',
}
