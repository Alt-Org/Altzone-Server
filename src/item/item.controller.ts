import {Body, Controller, Get, Param, Post} from "@nestjs/common";
import {_idDto} from "../common/dto/_id.dto";
import {ModelName} from "../common/enum/modelName.enum";
import {ItemService} from "./item.service";
import {ItemDto} from "./dto/item.dto";
import { Authorize } from "../authorization/decorator/Authorize";
import { Action } from "../authorization/enum/action.enum";
import { UniformResponse } from "../common/decorator/response/UniformResponse";
import { MoveItemDto } from "./dto/moveItem.dto";
import { LoggedUser } from "../common/decorator/param/LoggedUser.decorator";
import { User } from "../auth/user";

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

    @Post('/move')
    @UniformResponse()
    public async moveItems(@Body() body: MoveItemDto, @LoggedUser() user: User) {
        const [resp, errors] = await this.service.moveItem(body.item_id, body.destination_id, body.moveTo, user.player_id);
        if(errors)
            return [null, errors];
    }
}