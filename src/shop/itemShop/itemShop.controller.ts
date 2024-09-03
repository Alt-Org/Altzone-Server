import { RequestHelperService } from "../../requestHelper/requestHelper.service";
import { ItemShopService } from "./itemShop.service";
import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { BasicGET } from "../../common/base/decorator/BasicGET.decorator";
import { ModelName } from "../../common/enum/modelName.enum";
import { param } from "express-validator";
import { request } from "express";
import { _idDto } from "../../common/dto/_id.dto";
import { AddGetQueries } from "../../common/decorator/request/AddGetQueries.decorator";
import { ItemShopDto } from "./dto/itemshop.dto";
import { AddSearchQuery } from "../../common/interceptor/request/addSearchQuery.interceptor";
import { AddSortQuery } from "../../common/interceptor/request/addSortQuery.interceptor";
import { OffsetPaginate } from "../../common/interceptor/request/offsetPagination.interceptor";
import { IGetAllQuery } from "../../common/interface/IGetAllQuery";
import { GetAllQuery } from "../../common/decorator/param/GetAllQuery";
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