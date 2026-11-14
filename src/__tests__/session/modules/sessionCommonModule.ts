import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseOptions, mongoString } from '../../test_utils/const/db';
import { ModelName } from '../../../common/enum/modelName.enum';
import { SessionSchema } from '../../../session/session.schema';
import { SessionModule } from '../../../session/session.module';
import SessionService from '../../../session/session.service';

export default class SessionCommonModule {
  private constructor() {}

  private static module: TestingModule;

  static async getModule() {
    if (!SessionCommonModule.module)
      SessionCommonModule.module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(mongoString, mongooseOptions),
          MongooseModule.forFeature([
            { name: ModelName.SESSION, schema: SessionSchema },
          ]),
          SessionModule,
        ],
        providers: [SessionService],
      }).compile();

    return SessionCommonModule.module;
  }
}
