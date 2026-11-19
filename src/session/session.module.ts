import { Module } from "@nestjs/common";
import SessionService from "./session.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ModelName } from "../common/enum/modelName.enum";
import { SessionSchema } from "./session.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModelName.SESSION, schema: SessionSchema },
    ]),
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
