import { OnlinePlayerStatus } from '../enum/OnlinePlayerStatus';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export default class OnlinePlayerSearchQueryDto {
  /**
   * Filter online players
   *
   * @example ?search=status="UI"
   */
  @IsOptional()
  @IsArray()
  @IsEnum(OnlinePlayerStatus, { each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;

    const matches = value.match(/status="(.*?)"/g);
    if (!matches) return [];

    return matches.map((m) => m.replace(/status="|"$/g, ''));
  })
  search?: OnlinePlayerStatus[];
}
