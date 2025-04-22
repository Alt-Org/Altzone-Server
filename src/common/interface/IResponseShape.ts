import { ModelName } from '../enum/modelName.enum';

/**
 * Type representing the structure of response data.
 * - 'Array' represents a list of items.
 * - 'Object' represents a single item or a complex structure.
 */
type ResponseDataType = 'Array' | 'Object';

/**
 * Type representing an object that holds data keyed by the model name.
 *
 * @template T - The type of the data associated with each model name.
 */
type DataObject<T = any> = {
  [key in ModelName]?: T;
};

/**
 * Type representing response's extra data.
 *
 * @template T - The type of the metadata.
 *
 * @property metaData - Metadata associated with the document.
 */
type DocumentMetaObject<T = object> = {
  /**
   * Metadata associated with the document
   */
  metaData?: T;
};

/**
 * Combined type representing the response data structure,
 * which includes the main data and optional document metadata.
 *
 * @template D - The type of the main data.
 * @template M - The type of the document metadata.
 */
type Data<D = any, M = object> = DataObject<D> & DocumentMetaObject<M>;

/**
 * Interface representing the metadata for a response.
 *
 * @property dataKey - The key associated with the data in the response.
 * @property modelName - The name of the model to which the data belongs.
 * @property dataType - The type of the data. see {@link ResponseDataType}
 * @property dataCount - Count of items if the data is an array.
 */
interface ResponseMetaData {
  /**
   * The key associated with the data in the response
   */
  dataKey: string;
  /**
   * The name of the model to which the data belongs
   */
  modelName: ModelName;
  /**
   * The type of the data. see {@link ResponseDataType}
   */
  dataType: ResponseDataType;
  /**
   * Count of items if the data is an array
   */
  dataCount?: number;
}

/**
 * Pagination information, used to describe how the data is paginated.
 *
 * @property currentPage - The current page number.
 * @property limit - The maximum number of items per page.
 * @property offset - The offset from the start of the dataset.
 * @property itemCount - Total number of items available.
 * @property pageCount - Total number of pages available.
 */
interface PaginationData {
  /**
   * The current page number.
   */
  currentPage: number;
  /**
   * The maximum number of items per page
   */
  limit: number;
  /**
   * The offset from the start of the dataset
   */
  offset: number;
  /**
   * Total number of items available
   */
  itemCount?: number;
  /**
   * Total number of pages available
   */
  pageCount?: number;
}

/**
 * Response body shape containing data, metadata, and pagination information (for paginated requests).
 *
 * Notice that this shape is used only for successful responses, not for errors.
 *
 * @template D The type of the data payload.
 * @template M The type of the metadata.
 *
 * @property data - The main response data, see {@link Data}.
 * @property metaData - Metadata associated with the response, see {@link ResponseMetaData}.
 * @property paginationData - Pagination information, see {@link PaginationData}.
 */
export interface IResponseShape<D = any, M = object> {
  /**
   * The main response data, see {@link Data}
   */
  data: Data<D, M>;
  /**
   * Optional metadata associated with the response, see {@link ResponseMetaData}
   */
  metaData?: ResponseMetaData;
  /**
   * Optional pagination information, see {@link PaginationData}
   */
  paginationData?: PaginationData;
}
