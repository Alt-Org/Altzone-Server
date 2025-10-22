import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';

@Module({
  providers: [FriendshipService],
  controllers: [FriendshipController],
})
export class FriendshipModule {}
