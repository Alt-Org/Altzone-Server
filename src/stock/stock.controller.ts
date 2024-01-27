import {Body, Controller, Delete, Get, Param, Post, Put, Req} from "@nestjs/common";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {StockService} from "./stock.service";
import {StockDto} from "./dto/stock.dto";
import {CreateStockDto} from "./dto/createStock.dto";
import {UpdateStockDto} from "./dto/updateStock.dto";
import { Authorize } from "src/authorization/decorator/Authorize";
import { Action } from "src/authorization/enum/action.enum";
import {AddSearchQuery} from "../common/interceptor/request/addSearchQuery.interceptor";
import {GetAllQuery} from "../common/decorator/param/GetAllQuery";
import {IGetAllQuery} from "../common/interface/IGetAllQuery";
import { OffsetPaginate } from "src/common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "src/common/interceptor/request/addSortQuery.interceptor";

@Controller('stock')
export class StockController {
    public constructor(private readonly service: StockService) {
    }

    @Post()
    @Authorize({action: Action.create, subject: StockDto})
    @BasicPOST(StockDto)
    public create(@Body() body: CreateStockDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: StockDto})
    @BasicGET(ModelName.STOCK, StockDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @Get()
    @Authorize({action: Action.read, subject: StockDto})
    @OffsetPaginate(ModelName.STOCK)
    @AddSearchQuery(StockDto)
    @AddSortQuery(StockDto)
    @BasicGET(ModelName.STOCK, StockDto)
    public getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateStockDto})
    @BasicPUT(ModelName.STOCK)
    public update(@Body() body: UpdateStockDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: UpdateStockDto})
    @BasicDELETE(ModelName.STOCK)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}