import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import AddType from '../../common/base/decorator/AddType.decorator';
import { VotingType } from '../enum/VotingType.enum';
import { Vote } from '../schemas/vote.schema';
import { Type } from 'class-transformer';
import { Organizer } from './organizer.dto';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';

@AddType('CreateVotingDto')
export class CreateVotingDto {
  @ValidateNested()
  @Type(() => Organizer)
  organizer: Organizer;

  @IsDate()
  @IsOptional()
  endsOn?: Date;

  @IsEnum(VotingType)
  type: string;

  @IsInt()
  @IsOptional()
  minPercentage?: number;

  @IsMongoId()
  @IsOptional()
  entity_id?: string;

  @IsEnum(ItemName)
  @IsOptional()
  entity_name?: ItemName;

  @IsArray()
  @IsOptional()
  votes?: Vote[];
}
