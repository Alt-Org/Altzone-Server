import { IsEnum } from 'class-validator';
import { RequestType } from '../enum/requestType.enum';

export class RequestTypeDto {
  /**
   * Type of request
   *
   * @example "result"
   */
  @IsEnum(RequestType)
  type: RequestType;
}
