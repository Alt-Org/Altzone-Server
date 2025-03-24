import { SEReason } from '../../common/service/basicService/SEReason';

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Check that object is a ServiceError with reason LESS_THAN_MIN.
       */
      toBeSE_LESS_THAN_MIN(): R;

      /**
       * Check that object is a ServiceError with reason MISCONFIGURED.
       */
      toBeSE_MISCONFIGURED(): R;

      /**
       * Check that object is a ServiceError with reason MORE_THAN_MAX.
       */
      toBeSE_MORE_THAN_MAX(): R;

      /**
       * Check that object is a ServiceError with reason NOT_ALLOWED.
       */
      toBeSE_NOT_ALLOWED(): R;

      /**
       * Check that object is a ServiceError with reason NOT_ARRAY.
       */
      toBeSE_NOT_ARRAY(): R;

      /**
       * Check that object is a ServiceError with reason NOT_BOOLEAN.
       */
      toBeSE_NOT_BOOLEAN(): R;

      /**
       * Check that object is a ServiceError with reason NOT_DATE.
       */
      toBeSE_NOT_DATE(): R;

      /**
       * Check that object is a ServiceError with reason NOT_FOUND.
       */
      toBeSE_NOT_FOUND(): R;

      /**
       * Check that object is a ServiceError with reason NOT_NUMBER.
       */
      toBeSE_NOT_NUMBER(): R;

      /**
       * Check that object is a ServiceError with reason NOT_OBJECT.
       */
      toBeSE_NOT_OBJECT(): R;

      /**
       * Check that object is a ServiceError with reason NOT_STRING.
       */
      toBeSE_NOT_STRING(): R;

      /**
       * Check that object is a ServiceError with reason NOT_UNIQUE.
       */
      toBeSE_NOT_UNIQUE(): R;

      /**
       * Check that object is a ServiceError with reason REQUIRED.
       */
      toBeSE_REQUIRED(): R;

      /**
       * Check that object is a ServiceError with reason UNEXPECTED.
       */
      toBeSE_UNEXPECTED(): R;

      /**
       * Check that object is a ServiceError with reason VALIDATION.
       */
      toBeSE_VALIDATION(): R;

      /**
       * Check that object is a ServiceError with reason WRONG_ENUM.
       */
      toBeSE_WRONG_ENUM(): R;

      /**
       * Check that object has a provided ServiceError reason field.
       * @param expected Expected SEReason
       */
      toBeSE(expected: SEReason): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason LESS_THAN_MIN
       */
      toContainSE_LESS_THAN_MIN(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason MISCONFIGURED
       */
      toContainSE_MISCONFIGURED(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason MORE_THAN_MAX
       */
      toContainSE_MORE_THAN_MAX(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason NOT_ALLOWED
       */
      toContainSE_NOT_ALLOWED(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason NOT_ARRAY
       */
      toContainSE_NOT_ARRAY(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason NOT_BOOLEAN
       */
      toContainSE_NOT_BOOLEAN(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason NOT_DATE
       */
      toContainSE_NOT_DATE(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason NOT_FOUND
       */
      toContainSE_NOT_FOUND(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason NOT_NUMBER
       */
      toContainSE_NOT_NUMBER(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason NOT_OBJECT
       */
      toContainSE_NOT_OBJECT(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason NOT_STRING
       */
      toContainSE_NOT_STRING(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason NOT_UNIQUE
       */
      toContainSE_NOT_UNIQUE(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason REQUIRED
       */
      toContainSE_REQUIRED(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason UNEXPECTED
       */
      toContainSE_UNEXPECTED(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason VALIDATION
       */
      toContainSE_VALIDATION(): R;

      /**
       * Check that it is an array
       * containing at least one ServiceError with reason WRONG_ENUM
       */
      toContainSE_WRONG_ENUM(): R;

      /**
       * Check that it is an array
       * containing specified ServiceError reasons
       * @param expected Expected SEReason
       */
      toContainSE(expected: SEReason[]): R;

      /**
       * Check that it is an array
       * containing only errors with specified ServiceError reasons.
       * @param expected Expected SEReason
       */
      toEqualSE(expected: SEReason[]): R;
    }
  }
}

export {};
