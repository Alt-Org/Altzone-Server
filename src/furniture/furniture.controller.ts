import {Body, Controller, Delete, Get, Param, Post, Put, Query} from "@nestjs/common";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {GetQueryDto} from "../common/dto/getQuery.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {FurnitureService} from "./furniture.service";
import {FurnitureDto} from "./dto/furniture.dto";
import {CreateFurnitureDto} from "./dto/createFurniture.dto";
import {UpdateFurnitureDto} from "./dto/updateFurniture.dto";

@Controller('furniture')
export class FurnitureController{
    public constructor(
        private readonly service: FurnitureService
    ) {
    }

    @Post()
    @BasicPOST(FurnitureDto)
    public create(@Body() body: CreateFurnitureDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @BasicGET(ModelName.FURNITURE, FurnitureDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Query() query: GetQueryDto) {
        return this.service.readOneById(param._id);
    }

    @Get()
    @BasicGET(ModelName.FURNITURE, FurnitureDto)
    public getAll() {
        return this.service.readAll();
    }

    @Put()
    @BasicPUT(ModelName.FURNITURE)
    public update(@Body() body: UpdateFurnitureDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @BasicDELETE(ModelName.FURNITURE)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}