import { Module } from '@nestjs/common';
import { Voting, VotingSchema } from './schemas/voting.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { VotingController } from './voting.controller';
import VotingNotifier from './voting.notifier';
import { VotingService } from './voting.service';
import { PlayerModule } from '../player/player.module';
import { BullModule } from '@nestjs/bullmq';
import { VotingQueue } from './voting.queue';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Voting.name, schema: VotingSchema }]),
    PlayerModule,
    BullModule.registerQueue({
      name: 'voting',
    }),
  ],
  providers: [VotingService, VotingNotifier, VotingQueue],
  controllers: [VotingController],
  exports: [VotingService, VotingQueue],
})
export class VotingModule {}
