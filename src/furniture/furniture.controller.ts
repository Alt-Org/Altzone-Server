import {Body, Controller, Delete, Get, Param, Post, Put, Req} from "@nestjs/common";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {FurnitureService} from "./furniture.service";
import {FurnitureDto} from "./dto/furniture.dto";
import {CreateFurnitureDto} from "./dto/createFurniture.dto";
import {UpdateFurnitureDto} from "./dto/updateFurniture.dto";
import { Authorize } from "src/authorization/decorator/Authorize";
import { Action } from "src/authorization/enum/action.enum";
import {AddSearchQuery} from "../common/interceptor/request/addSearchQuery.interceptor";
import {GetAllQuery} from "../common/decorator/param/GetAllQuery";
import {IGetAllQuery} from "../common/interface/IGetAllQuery";
import { OffsetPaginate } from "src/common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "src/common/interceptor/request/addSortQuery.interceptor";

@Controller('furniture')
export class FurnitureController{
    public constructor(private readonly service: FurnitureService) {
    }

    @Post()
    @Authorize({action: Action.create, subject: FurnitureDto})
    @BasicPOST(FurnitureDto)
    public create(@Body() body: CreateFurnitureDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: FurnitureDto})
    @BasicGET(ModelName.FURNITURE, FurnitureDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @Get()
    @Authorize({action: Action.read, subject: FurnitureDto})
    @OffsetPaginate(ModelName.FURNITURE)
    @AddSearchQuery(FurnitureDto)
    @AddSortQuery(FurnitureDto)
    @BasicGET(ModelName.FURNITURE, FurnitureDto)
    public getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateFurnitureDto})
    @BasicPUT(ModelName.FURNITURE)
    public update(@Body() body: UpdateFurnitureDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: UpdateFurnitureDto})
    @BasicDELETE(ModelName.FURNITURE)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}