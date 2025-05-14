import {
  IsEnum,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import AddType from '../../../common/base/decorator/AddType.decorator';
import { Coins } from '../../../shop/enum/coins.enum.dto';
import { IsClanExists } from '../../../clan/decorator/validation/IsClanExists.decorator';

@AddType('ClanCoinsDto')
export class ClanCoinsDto {
  
  @IsClanExists()
  @IsMongoId()
  @IsOptional()
  clan_id: string;

  @IsEnum(Coins)
  amount: Coins;
}
