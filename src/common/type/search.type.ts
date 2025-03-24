/**
 * Mongo DB search parameter
 */
export type DBSelector = '$eq' | '$gt' | '$gte' | '$lt' | '$lte';
/**
 * URL query search parameter
 */
export type QuerySelector = '=' | '>' | '>=' | '<' | '<=';
/**
 * URL query search operator
 */
export type Operator = 'AND' | 'OR';

/**
 * Object containing Mongo DB search queries syntax
 * and their according search parameters used in url query part on the client side
 */
export const dbToQuery: Record<DBSelector, QuerySelector> = {
  $eq: '=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
};
/**
 * Object containing search parameters used in url query part on the client side
 * and their according values in Mongo DB syntax
 */
export const queryToDB: Record<QuerySelector, DBSelector> = {
  '=': '$eq',
  '>': '$gt',
  '>=': '$gte',
  '<': '$lt',
  '<=': '$lte',
};

/**
 * Object containing URL search query operators
 */
export const operators: Record<Operator, string> = {
  OR: 'OR',
  AND: 'AND',
};
/**
 * Array of URL search query parameters
 */
export const querySelectors: string[] = Object.values(dbToQuery);
