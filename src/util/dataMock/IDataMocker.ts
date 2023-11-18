export interface IDataMocker<T>{
    getValid(): Partial<T>;
    getWithoutFields(fieldsToEscape: string[]): Partial<T>;
    getWithoutFields(fieldsToEscape: string[]): Partial<T>;
    getWrongDT(fieldsToBeWrong?: string[]): {};
    getObjMeta(): {};
    getArrMeta(count: number): {};
}