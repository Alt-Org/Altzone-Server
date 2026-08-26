// Helper function to mitigate CVE-2026-73562 (Mongoose prototype pollution vulnerability)
import { BadRequestException } from '@nestjs/common';

export function validateMongoUpdate(value: unknown): void {
  if (hasUnsafeMongoUpdateKey(value)) {
    throw new BadRequestException('Invalid or dangerous update key detected');
  }
}

export function hasUnsafeMongoUpdateKey(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;

  const proto = Object.getPrototypeOf(value);
  const isPlainObjectOrArray =
    Array.isArray(value) || proto === null || proto === Object.prototype;

  if (!isPlainObjectOrArray) return false;

  const keys = Array.isArray(value) ? [] : Object.getOwnPropertyNames(value);

  for (const key of keys) {
    if (
      key === '__proto__' ||
      key.startsWith('__proto__.') ||
      key.includes('.__proto__.') ||
      key === 'constructor.prototype' ||
      key.startsWith('constructor.prototype.')
    ) {
      return true;
    }

    if (hasUnsafeMongoUpdateKey((value as Record<string, unknown>)[key])) {
      return true;
    }
  }

  return false;
}
