import {Body, Controller, Delete, Get, Param, Post, Put, Req} from "@nestjs/common";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {ModelName} from "../common/enum/modelName.enum";
import {StockService} from "./stock.service";
import {StockDto} from "./dto/stock.dto";
import {CreateStockDto} from "./dto/createStock.dto";
import {UpdateStockDto} from "./dto/updateStock.dto";
import { Authorize } from "../authorization/decorator/Authorize";
import { Action } from "../authorization/enum/action.enum";
import {AddSearchQuery} from "../common/interceptor/request/addSearchQuery.interceptor";
import {GetAllQuery} from "../common/decorator/param/GetAllQuery";
import {IGetAllQuery} from "../common/interface/IGetAllQuery";
import { OffsetPaginate } from "../common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "../common/interceptor/request/addSortQuery.interceptor";
import { UniformResponse } from "../common/decorator/response/UniformResponse";

@Controller('stock')
export class StockController {
    public constructor(private readonly service: StockService) {
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: StockDto})
    @UniformResponse(ModelName.STOCK)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id);//, request['mongoPopulate']);
    }

    @Get()
    @Authorize({action: Action.read, subject: StockDto})
    @OffsetPaginate(ModelName.STOCK)
    @AddSearchQuery(StockDto)
    @AddSortQuery(StockDto)
    @UniformResponse(ModelName.STOCK)
    public getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }
}