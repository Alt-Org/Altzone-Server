
export type GetWrongFieldDTOptions = {randStrings?: string[], min?: number, max?: number};

export class CommonMocker {
    public static removeObjectFields<T=any>(obj: T, fieldsToRemove: string[]): Partial<T> {
        let result: Partial<T> = {};
        for(let field in obj){
            if(!fieldsToRemove.includes(field))
                result[field] = obj[field];
        }

        return result;
    }

    public static generateObjWithWrongDT<T=Object>(obj: T, fieldsToBeWrong?: string[], options?: GetWrongFieldDTOptions): {}{
        if(fieldsToBeWrong){
            for(let i=0; i<fieldsToBeWrong.length; i++){
                const field = fieldsToBeWrong[i];
                const value = obj[field];
                if(value != null && (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string'))
                    obj[field] = this.getWrongFieldDataType(value, options);
                else
                    throw new Error(`CommonMocker.generateObjWithWrongDT(): could not generate value for '${field}' field, because it is a ${typeof field} or undefined`);
            }

            return obj;
        }

        for(let field in obj){
            const value = obj[field];
            if(typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string')
                obj[field] = this.getWrongFieldDataType(value);
            else
                throw new Error(`CommonMocker.generateObjWithWrongDT(): could not generate value for ${field} field, because it is a ${typeof field}`);
        }

        return obj;
    }

    public static getMetadataForObject(dataKey: string, modelName: string){
        return {
            dataKey,
            modelName,
            dataType: 'Object',
            dataCount: 1
        }
    }
    public static getMetadataForArray(dataKey: string, modelName: string, dataCount: number){
        return {
            dataKey,
            modelName,
            dataType: 'Array',
            dataCount
        }
    }

    public static getWrongFieldDataType(fieldValue: boolean | number | string, options?: GetWrongFieldDTOptions): any{
        const dataTypesForBoolean = ['number', 'string'];
        const dataTypesForNumber = ['boolean', 'string'];
        const dataTypesForString = ['boolean', 'number'];

        if(typeof fieldValue === 'boolean'){
            const type = this.chooseRandArrElem(dataTypesForBoolean);
            if(type === 'number')
                return this.getRandNum(options?.min, options?.max);
            else if(type === 'string')
                return this.getRandString(options?.randStrings);
        }else if(typeof fieldValue === 'number'){
            const type = this.chooseRandArrElem(dataTypesForNumber);
            if(type === 'boolean')
                return this.getRandBoolean();
            else if(type === 'string')
                return this.getRandString(options?.randStrings);
        } else if(typeof fieldValue === 'string'){
            const type = this.chooseRandArrElem(dataTypesForString);
            if(type === 'boolean')
                return this.getRandBoolean();
            else if(type === 'number')
                return this.getRandNum(options?.min, options?.max);
        }
    }

    public static getRandBoolean(): boolean{
        const values = [true, false];
        return this.chooseRandArrElem(values);
    }
    public static getRandNum(min: number=0, max: number=100): number{
        return Math.round(Math.random() * (max - min)) + min;
    }
    public static getRandString(strings?: string[]): string{
        const values = (strings && strings.length !== 0) ?
            strings :
            ['RandomString', 'anotherString', 'HelloWorld', 'testing', 'Str', 'my_string'];
        return this.chooseRandArrElem(values) + this.getRandNum(0, 1000);
    }

    public static chooseRandArrElem(arr: any[]){
        const randIndex = this.getRandNum(0, arr.length-1);
        return arr[randIndex];
    }
}