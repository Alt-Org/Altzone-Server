import { ClanBasicRight } from '../../enum/clanBasicRight.enum';

/**
 * Checks whenever provided object is a valid role rights object.
 *
 * @param rights object to be checked
 *
 * @returns true if the provided object is a valid role rights object and if not
 */
export function areRoleRightsValid(
  rights: Record<string, true> | null | undefined,
): boolean {
  if (!rights || typeof rights !== 'object') return false;

  const allowedKeys = new Set(Object.values(ClanBasicRight));

  for (const [key, value] of Object.entries(rights)) {
    if (!allowedKeys.has(key as any)) return false;
    if (value !== true) return false;
  }

  return true;
}
