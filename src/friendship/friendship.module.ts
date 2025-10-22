import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { FriendshipSchema } from './friendship.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.FRIENDSHIP, schema: FriendshipSchema },
    ]),
  ],
  providers: [FriendshipService],
  controllers: [FriendshipController],
})
export class FriendshipModule {}
