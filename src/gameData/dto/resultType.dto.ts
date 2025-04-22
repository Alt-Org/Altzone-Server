import { IsEnum } from 'class-validator';
import { RequestType } from '../enum/requestType.enum';

export class RequestTypeDto {
  @IsEnum(RequestType)
  type: RequestType;
}
