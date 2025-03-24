import { IsInt, IsString } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('CreateMessageDto')
export class CreateMessageDto {
  @IsInt()
  id: number;

  @IsString()
  senderUsername: string;

  @IsString()
  content: string;

  @IsInt()
  feeling: number;
}
