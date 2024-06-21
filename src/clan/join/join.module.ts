import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { ModelName } from 'src/common/enum/modelName.enum';
import { joinController } from './join.controller';
import { JoinService } from './join.service';
import { RequestHelperModule } from 'src/requestHelper/requestHelper.module';
import { joinSchema } from './join.schema';
import { ClanModule } from '../clan.module';
import { RoomModule } from 'src/Room/room.module';

@Module({
    imports: [
        MongooseModule.forFeature([ {name: ModelName.JOIN, schema: joinSchema} ]),
        RequestHelperModule,
        ClanModule,
        RoomModule
    ],
    controllers: [joinController],
    providers: [ JoinService ],
    exports: [JoinService]
})
export class joinModule {}