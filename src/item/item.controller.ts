import {Body, Controller, Delete, Get, Param, Post, Put, Req} from "@nestjs/common";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
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
import { UniformResponse } from "src/common/decorator/response/UniformResponse";
import { Serialize } from "src/common/interceptor/response/Serialize";

@Controller('item')
export class ItemController {
    public constructor(private readonly service: ItemService) {
    }

    @Post()
    @Authorize({action: Action.create, subject: ItemDto})
    @UniformResponse(ModelName.ITEM)
    public create(@Body() body: CreateItemDto) {
        return this.service.createOne(body);
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: ItemDto})
    @UniformResponse(ModelName.ITEM)
    //@AddGetQueries()
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id);// request['mongoPopulate']);
    }

    //@Get()
    //@Authorize({action: Action.read, subject: ItemDto})
    //@OffsetPaginate(ModelName.ITEM)
    //@AddSearchQuery(ItemDto)
    //@AddSortQuery(ItemDto)
    //@Serialize(ItemDto)
    //@UniformResponse(ModelName.ITEM)
    //public getAll(@GetAllQuery() query: IGetAllQuery) {
    //    return this.service.readAll(query);
    //}

    @Authorize({action: Action.update, subject: UpdateItemDto})
    @UniformResponse()
    public update(@Body() body: UpdateItemDto){
        return this.service.updateOneById(body);
    }

    @Authorize({action: Action.delete, subject: UpdateItemDto})
    @UniformResponse()
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}