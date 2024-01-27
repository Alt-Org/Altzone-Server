import {Body, Controller, Delete, Get, Param, Post, Put, Req} from "@nestjs/common";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {ItemService} from "./item.service";
import {ItemDto} from "./dto/item.dto";
import {CreateItemDto} from "./dto/createItem.dto";
import {UpdateItemDto} from "./dto/updateItem.dto";
import { Authorize } from "src/authorization/decorator/Authorize";
import { Action } from "src/authorization/enum/action.enum";
import {AddSearchQuery} from "../common/interceptor/request/addSearchQuery.interceptor";
import {GetAllQuery} from "../common/decorator/param/GetAllQuery";
import {IGetAllQuery} from "../common/interface/IGetAllQuery";
import { OffsetPaginate } from "src/common/interceptor/request/offsetPagination.interceptor";
import { AddSortQuery } from "src/common/interceptor/request/addSortQuery.interceptor";

@Controller('furniture')
export class ItemController {
    public constructor(private readonly service: ItemService) {
    }

    @Post()
    @Authorize({action: Action.create, subject: ItemDto})
    @BasicPOST(ItemDto)
    public create(@Body() body: CreateItemDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: ItemDto})
    @BasicGET(ModelName.ITEM, ItemDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @Get()
    @Authorize({action: Action.read, subject: ItemDto})
    @OffsetPaginate(ModelName.ITEM)
    @AddSearchQuery(ItemDto)
    @AddSortQuery(ItemDto)
    @BasicGET(ModelName.ITEM, ItemDto)
    public getAll(@GetAllQuery() query: IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateItemDto})
    @BasicPUT(ModelName.ITEM)
    public update(@Body() body: UpdateItemDto){
        return this.service.updateOneById(body);
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: UpdateItemDto})
    @BasicDELETE(ModelName.ITEM)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}