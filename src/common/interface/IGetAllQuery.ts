export interface IGetAllQuery {
    select?: string[];
    filter?: object;
    limit?: number;
    sort?: object;
}