/**
 * Interface represents options of a read many methods.
 *
 * This interface's fields can be used straight in mongoose read/find etc. methods.
 */
export interface IGetAllQuery {
  /**
   * search condition to apply
   */
  filter: object;
  /**
   * which fields to grab from DB
   */
  select?: string[];
  /**
   * max amount of objects to return
   */
  limit: number;
  /**
   * sorting order based on field(s). Value -1 for descending (from 10-1 or Z-A) and value 1 for ascending (1-10 or A-Z)
   */
  sort: Record<string, 1 | -1>;
  /**
   * how many found objects to skip from the start
   */
  skip: number;
}
