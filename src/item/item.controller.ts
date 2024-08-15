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

    @Get('/:_id')
    @Authorize({action: Action.read, subject: ItemDto})
    @UniformResponse(ModelName.ITEM)
    //@AddGetQueries()
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id);// request['mongoPopulate']);
    }
}