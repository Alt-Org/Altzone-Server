import { ClanRole } from './ClanRole.schema';
import { ClanRoleType } from './enum/clanRoleType.enum';
import { ClanBasicRight } from './enum/clanBasicRight.enum';

/**
 * Default role, which has all the basic rights
 */
export const LeaderClanRole: Omit<ClanRole, '_id'> = {
  name: 'leader',
  clanRoleType: ClanRoleType.DEFAULT,
  rights: {
    [ClanBasicRight.EDIT_SOULHOME]: true,
    [ClanBasicRight.EDIT_CLAN_DATA]: true,
    [ClanBasicRight.EDIT_MEMBER_RIGHTS]: true,
    [ClanBasicRight.MANAGE_ROLE]: true,
    [ClanBasicRight.SHOP]: true,
  },
};

/**
 * Default role, which has no basic rights at all
 */
export const MemberClanRole: Omit<ClanRole, '_id'> = {
  name: 'member',
  clanRoleType: ClanRoleType.DEFAULT,
  rights: {},
};

/**
 * Named role, which is used with clan default roles on initialization
 */
export const ElderClanRole: Omit<ClanRole, '_id'> = {
  name: 'elder',
  clanRoleType: ClanRoleType.NAMED,
  rights: {
    [ClanBasicRight.EDIT_SOULHOME]: true,
    [ClanBasicRight.EDIT_CLAN_DATA]: true,
    [ClanBasicRight.SHOP]: true,
  },
};

/**
 * All roles, which each clan should have on creation
 */
export const initializationClanRoles: Omit<ClanRole, '_id'>[] = [
  LeaderClanRole,
  MemberClanRole,
  ElderClanRole,
];
