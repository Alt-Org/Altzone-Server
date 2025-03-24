import { IsString } from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';

@AddType('SignInDto')
export class SignInDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
