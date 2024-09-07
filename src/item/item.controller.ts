import {Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Req} from "@nestjs/common";
import {_idDto} from "../common/dto/_id.dto";
import {ModelName} from "../common/enum/modelName.enum";
import {ItemService} from "./item.service";
import {ItemDto} from "./dto/item.dto";
import { Authorize } from "../authorization/decorator/Authorize";
import { Action } from "../authorization/enum/action.enum";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { MoveItemDto } from "./dto/moveItem.dto";

@Controller('item')
export class ItemController {
    public constructor(private readonly service: ItemService) {
    }
    @Get('/:_id')
    @Authorize({action: Action.read, subject: ItemDto})
    @UniformResponse(ModelName.ITEM)
    public get(@Param() param: _idDto) {
        return this.service.readOneById(param._id);
    }

    @Patch('/move')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UniformResponse(ModelName.ITEM)
    public async moveItems(@Body() body: MoveItemDto, @Req() req: any) {
        return this.service.moveItem(body.item_id, body.destination_id, body.move_to, req.user.player_id);
    }
}