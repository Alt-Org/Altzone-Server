export interface IGetAllQuery {
    filter: object;
    select?: string[];
    limit: number;
    sort: object;
    skip: number;
}