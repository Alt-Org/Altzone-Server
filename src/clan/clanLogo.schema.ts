import { Prop } from '@nestjs/mongoose';
import { LogoType } from './enum/logoType.enum';
import { IsHexColor } from 'class-validator';

class ClanLogo {
  @Prop({ type: String, enum: LogoType, required: true })
  logoType: LogoType;

  @Prop({ type: [String], required: true })
  @IsHexColor({ each: true })
  pieceColors: string[];
}

export { ClanLogo };
