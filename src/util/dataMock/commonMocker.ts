import mongoose from "mongoose";

export type GetWrongFieldDTOptions = {randStrings?: string[], min?: number, max?: number};

export enum DataType {
    STRING = 'a string',
    INTEGER = 'an integer number',
    FLOAT = 'a float number',
    BOOLEAN = 'a boolean',
    ARRAY = 'an array'
}

export class CommonMocker {

    public generateNotUniqueFieldsResponse(values: object){
        const errorArray: string[] = [];
        for(const field in values){
            errorArray.push(`Field '${field}' with value '${values[field]}' already exists`);
        }
        return { statusCode: 409, message: errorArray, error: 'Conflict' };
    }

    public generateWrongDataTypesResponse<T=object>(rightObject: T, wrongFields?: string[]){
        if(wrongFields){
            const errorArray: string[] = [];
            for(let i=0; i<wrongFields.length; i++){
                const field = wrongFields[i];
                const value = rightObject[field];
                errorArray.push(this.getWrongDTErrorString(field, value));
            }

            return { statusCode: 400, message: errorArray, error: 'Bad Request' };
        }

        const errorArray: string[] = [];
        for(const field in rightObject){
            const value = rightObject[field];
            errorArray.push(this.getWrongDTErrorString(field, value));
        }

        return { statusCode: 400,  message: errorArray, error: 'Bad Request' };
    }

    public removeObjectFields<T=any>(obj: T, fieldsToRemove: string[]): Partial<T> {
        const result: Partial<T> = {};
        for(const field in obj){
            if(!fieldsToRemove.includes(field))
                result[field] = obj[field];
        }

        return result;
    }

    public generateObjWithWrongDT<T=object>(obj: T, fieldsToBeWrong?: string[], options?: GetWrongFieldDTOptions): unknown {
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

        for(const field in obj){
            const value = obj[field];
            if(typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string')
                obj[field] = this.getWrongFieldDataType(value);
            else
                throw new Error(`CommonMocker.generateObjWithWrongDT(): could not generate value for ${field} field, because it is a ${typeof field}`);
        }

        return obj;
    }

    public getMetadataForObject(dataKey: string, modelName: string){
        return {
            dataKey,
            modelName,
            dataType: 'Object',
            dataCount: 1
        }
    }
    public getMetadataForArray(dataKey: string, modelName: string, dataCount: number){
        return {
            dataKey,
            modelName,
            dataType: 'Array',
            dataCount
        }
    }

    public getWrongFieldDataType(fieldValue: boolean | number | string, options?: GetWrongFieldDTOptions): any{
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

    public async cleanDB(){
        const db = await mongoose.connect(`mongodb://testUser:superSecretPassword@127.0.0.1:27017`, {dbName: 'altzone_test'});

        const collections = await db.connection.db.collections();

        for (const collection of collections) {
            await collection.deleteMany({});
        }

        await db.connection.close();
    }

    public getRandBoolean(): boolean{
        const values = [true, false];
        return this.chooseRandArrElem(values);
    }
    public getRandNum(min: number=0, max: number=100): number{
        return Math.round(Math.random() * (max - min)) + min;
    }
    public getRandString(strings?: string[]): string{
        const values = (strings && strings.length !== 0) ?
            strings :
            ['RandomString', 'anotherString', 'HelloWorld', 'testing', 'Str', 'my_string'];
        return this.chooseRandArrElem(values) + this.getRandNum(0, 1000);
    }

    public chooseRandArrElem(arr: any[]){
        const randIndex = this.getRandNum(0, arr.length-1);
        return arr[randIndex];
    }

    private getWrongDTErrorString(field: string, value: any){
        let valueError = '';
        if(typeof value === 'string')
            valueError = DataType.STRING;
        else if(typeof value === 'boolean')
            valueError = DataType.BOOLEAN;
        else if(typeof value === 'object' && value.length)
            valueError = DataType.ARRAY;
        else if(typeof value === 'number')
            valueError = value % 1 === 0 ? DataType.INTEGER : DataType.FLOAT;

        return `${field} must be ${valueError}`
    }
}