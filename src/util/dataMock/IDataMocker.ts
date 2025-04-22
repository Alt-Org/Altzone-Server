export interface IDataMocker<T> {
  getValid(): Partial<T>;
  getWithoutFields(fieldsToEscape: string[]): Partial<T>;
  getWithoutFields(fieldsToEscape: string[]): Partial<T>;
  getWrongDT(fieldsToBeWrong?: string[]): object;
  getObjMeta(): object;
  getArrMeta(count: number): object;
}
