import { RequestHelperService } from "src/requestHelper/requestHelper.service";
import { ItemShopService } from "./itemshop.service";
import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { BasicGET } from "src/common/base/decorator/BasicGET.decorator";
import { ModelName } from "src/common/enum/modelName.enum";
import { param } from "express-validator";
import { request } from "express";
import { _idDto } from "src/common/dto/_id.dto";
import { AddGetQueries } from "src/common/decorator/request/AddGetQueries.decorator";
import { ItemShopDto } from "./dto/itemshop.dto";
import { AddSearchQuery } from "src/common/interceptor/request/addSearchQuery.interceptor";
import { AddSortQuery } from "src/common/interceptor/request/addSortQuery.interceptor";
import { OffsetPaginate } from "src/common/interceptor/request/offsetPagination.interceptor";
import { IGetAllQuery } from "src/common/interface/IGetAllQuery";
import { GetAllQuery } from "src/common/decorator/param/GetAllQuery";
@Controller('ItemShop')
export class ItemShopController {
    public constructor(private readonly service: ItemShopService) {
    }
    
    @Get()
    @OffsetPaginate(ModelName.ITEMSHOP)
    @AddSearchQuery(ItemShopDto)
    @AddSortQuery(ItemShopDto)
    @BasicGET(ModelName.ITEMSHOP, ItemShopDto)
    public async getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }
    @Get("/:_id")
    @AddGetQueries()
    @AddSearchQuery(ItemShopDto)
    @AddSortQuery(ItemShopDto)
    @BasicGET(ModelName.ITEMSHOP,ItemShopDto)
    public async get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

}