import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { FriendshipSchema } from './friendship.schema';
import FriendshipNotifier from './friendship.notifier';
import { PlayerSchema } from '../player/schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.FRIENDSHIP, schema: FriendshipSchema },
      { name: ModelName.PLAYER, schema: PlayerSchema },
    ]),
  ],
  providers: [FriendshipService, FriendshipNotifier],
  controllers: [FriendshipController],
})
export class FriendshipModule {}
