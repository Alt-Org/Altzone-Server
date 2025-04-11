import { ClanBasicRight } from '../../enum/clanBasicRight.enum';

/**
 * Checks whenever provided object is a valid role rights object.
 *
 * @param rights object to be checked
 *
 * @returns true if the provided object is a valid role rights object and if not
 */
export function areRoleRightsValid(rights: Map<ClanBasicRight, true>) {
  if (!rights) return false;

  const allowedKeys = new Set(Object.values(ClanBasicRight));

  for (const [key, value] of rights.entries()) {
    if (!allowedKeys.has(key)) return false;

    if (value !== true) return false;
  }

  return true;
}
