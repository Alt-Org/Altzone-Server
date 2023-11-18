export class CommonMocker {
    public static removeObjectFields<T=any>(obj: T, fieldsToRemove: string[]): Partial<T> {
        let result: Partial<T> = {};
        for(let field in obj){
            if(!fieldsToRemove.includes(field))
                result[field] = obj[field];
        }

        return result;
    }

    public static generateObjWithWrongDT<T=any>(obj: T, fieldsToBeWrong?: string[]): {}{
        if(fieldsToBeWrong){
            for(let i=0; i<fieldsToBeWrong.length; i++){
                const field = fieldsToBeWrong[i];
                const value = obj[field];
                const wrongTypeValue = this.getWrongFieldDataType(value);

                obj[field] = wrongTypeValue;
            }

            return obj;
        }

        for(let field in obj){
            const value = obj[field];
            const wrongTypeValue = this.getWrongFieldDataType(value);
            obj[field] = wrongTypeValue;
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

    public static getWrongFieldDataType(fieldValue: boolean | number | string): any{
        const dataTypesForBoolean = ['number', 'string'];
        const dataTypesForNumber = ['boolean', 'string'];
        const dataTypesForString = ['boolean', 'number'];

        if(typeof fieldValue === 'boolean'){
            const type = this.chooseRandArrElem(dataTypesForBoolean);
            if(type === 'number')
                return this.getRandNum();
            else if(type === 'string')
                return this.getRandString();
        }else if(typeof fieldValue === 'number'){
            const type = this.chooseRandArrElem(dataTypesForNumber);
            if(type === 'number')
                return this.getRandNum();
            else if(type === 'string')
                return this.getRandString();
        } else if(typeof fieldValue === 'string'){
            const type = this.chooseRandArrElem(dataTypesForString);
            if(type === 'boolean')
                return this.getRandBoolean;
            else if(type === 'number')
                return this.getRandNum();
        }
    }

    public static getRandBoolean(): boolean{
        const values = [true, false];
        return this.chooseRandArrElem(values);
    }
    public static getRandNum(min: number=0, max: number=100): number{
        return Math.floor(Math.random() * (max - min)) + min;
    }
    public static getRandString(): string{
        const values = ['randomString', 'anotherString', 'helloWorld', 'testing'];
        return this.chooseRandArrElem(values) + this.getRandNum(0,1000);
    }

    public static chooseRandArrElem(arr: any[]){
        const randIndex = this.getRandNum(0,arr.length-1);
        return arr[randIndex];
    }
}