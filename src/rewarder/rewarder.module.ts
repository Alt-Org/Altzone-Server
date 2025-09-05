import { Module } from '@nestjs/common';
import { PlayerModule } from '../player/player.module';
import { ClanModule } from '../clan/clan.module';
import { PlayerRewarder } from './playerRewarder/playerRewarder.service';
import { ClanRewarder } from './clanRewarder/clanRewarder.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { PlayerSchema } from '../player/schemas/player.schema';
import { ClanSchema } from '../clan/clan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.PLAYER, schema: PlayerSchema },
      { name: ModelName.CLAN, schema: ClanSchema },
    ]),
    PlayerModule,
    ClanModule,
  ],
  providers: [PlayerRewarder, ClanRewarder],
  exports: [PlayerRewarder, ClanRewarder],
})
export class RewarderModule {}
