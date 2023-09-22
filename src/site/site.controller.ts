import { Controller, Get, Param } from "@nestjs/common";
import { SiteService } from "./site.service";


@Controller('site')
export class SiteController{
    public constructor(
        private readonly service: SiteService,
    ) {
    }

    @Get('/:folder')
    public getImagesData(@Param() param: any) {
        console.log(param);
        return null;
    }
}