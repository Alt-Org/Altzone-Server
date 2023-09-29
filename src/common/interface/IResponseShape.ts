import {ModelName} from "../enum/modelName.enum";

type ResponseDataType = 'Array' | 'Object';
type DataObject<T=any> = {
    [key in ModelName]?: T;
}
type DocumentMetaObject<T=object> = {
    metaData?: T;
}
type Data<D=any, M=object> = DataObject<D> & DocumentMetaObject<M>;
interface ResponseMetaData {
    dataKey: string;
    modelName: ModelName;
    dataType: ResponseDataType;
    documentMetaDataKeys: string[];
    dataCount?: number;
}

export interface IResponseShape<D=any, M=object> {
    data: Data<D, M>;
    metaData?: ResponseMetaData;
}