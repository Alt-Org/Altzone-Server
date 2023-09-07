export type DBSelector = '$eq' | '$gt' | '$gte' | '$lt' | '$lte';
export type QuerySelector = '=' | '>' | '>=' | '<' | '<=';
export type Operator = 'AND' | 'OR';

export const dbToQuery: Record<DBSelector, QuerySelector> = {
    '$eq' : '=' ,
    '$gt' : '>' ,
    '$gte' : '>=' ,
    '$lt' : '<' ,
    '$lte' : '<='
}
export const queryToDB: Record<QuerySelector, DBSelector> = {
    '=' : '$eq',
    '>' : '$gt',
    '>=' : '$gte',
    '<' : '$lt',
    '<=' : '$lte'
}

export const operators: Record<Operator, string> = {
    OR: 'OR',
    AND: 'AND'
}
export const querySelectors: string[] = Object.values(dbToQuery);