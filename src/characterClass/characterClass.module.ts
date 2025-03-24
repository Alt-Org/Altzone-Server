import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CharacterClassSchema } from './characterClass.schema';
import { RequestHelperModule } from '../requestHelper/requestHelper.module';
import { ModelName } from '../common/enum/modelName.enum';
import { CharacterClassController } from './characterClass.controller';
import { CharacterClassService } from './characterClass.service';
import { isCharacterClassExists } from './decorator/validation/IsCharacterClassExists.decorator';

//Modules are used by Nest, just copy paste and adjust to your needs
@Module({
  imports: [
    //What model the controller or service uses (for mongoose)
    MongooseModule.forFeature([
      { name: ModelName.CHARACTER_CLASS, schema: CharacterClassSchema },
    ]),
    //What other modules (services etc.) this module use
    RequestHelperModule,
  ],
  controllers: [CharacterClassController],
  providers: [CharacterClassService, isCharacterClassExists],
  //What to export, that other modules can use, by default nothing is exported, usually you want to export the service class
  exports: [CharacterClassService],
})
export class CharacterClassModule {}
