export interface IGetAllQuery {
    filter: object;
    select?: string[];
    limit: number;
    sort: Record<string, 1 | -1>;
    skip: number;
}