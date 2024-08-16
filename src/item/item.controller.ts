import {Controller, Get, Param, Req} from "@nestjs/common";
import {_idDto} from "../common/dto/_id.dto";
import {ModelName} from "../common/enum/modelName.enum";
import {ItemService} from "./item.service";
import {ItemDto} from "./dto/item.dto";
import { Authorize } from "../authorization/decorator/Authorize";
import { Action } from "../authorization/enum/action.enum";
import { UniformResponse } from "../common/decorator/response/UniformResponse";

@Controller('item')
export class ItemController {
    public constructor(private readonly service: ItemService) {
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: ItemDto})
    @UniformResponse(ModelName.ITEM)
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id);
    }
}