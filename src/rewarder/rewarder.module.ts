import { Module } from '@nestjs/common';
import { PlayerModule } from '../player/player.module';
import { ClanModule } from '../clan/clan.module';
import { PlayerRewarder } from './playerRewarder/playerRewarder.service';
import { ClanRewarder } from './clanRewarder/clanRewarder.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { PlayerSchema } from '../player/schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.PLAYER, schema: PlayerSchema },
    ]),
    PlayerModule,
    ClanModule,
  ],
  providers: [PlayerRewarder, ClanRewarder],
  exports: [PlayerRewarder, ClanRewarder],
})
export class RewarderModule {}
