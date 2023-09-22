import {Module} from '@nestjs/common';
import {SiteService} from "./site.service";
import { SiteController } from './site.controller';

@Module({
    imports: [],
    controllers: [SiteController],
    providers: [ SiteService ],
    exports: [ SiteService ]
})
export class SiteModule {}