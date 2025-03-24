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

  @IsArray()
  @IsOptional()
  votes?: Vote[];
}
