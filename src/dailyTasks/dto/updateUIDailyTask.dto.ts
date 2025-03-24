import { IsInt, IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateUIDailyTaskDto {
  @IsString()
  @IsMongoId()
  _id: string;

  @IsOptional()
  @IsInt()
  amount: number;
}
