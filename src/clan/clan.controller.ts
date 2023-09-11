import {ClanService} from "./clan.service";
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Req
} from "@nestjs/common";
import {CreateClanDto} from "./dto/createClan.dto";
import {UpdateClanDto} from "./dto/updateClan.dto";
import {ClanDto} from "./dto/clan.dto";
import {BasicPOST} from "../common/base/decorator/BasicPOST.decorator";
import {BasicGET} from "../common/base/decorator/BasicGET.decorator";
import {AddGetQueries} from "../common/decorator/request/AddGetQueries.decorator";
import {_idDto} from "../common/dto/_id.dto";
import {BasicDELETE} from "../common/base/decorator/BasicDELETE.decorator";
import {BasicPUT} from "../common/base/decorator/BasicPUT.decorator";
import {ModelName} from "../common/enum/modelName.enum";
import {Authorize} from "../authorization/decorator/Authorize";
import {Action} from "../authorization/enum/action.enum";
import {MongooseError} from "mongoose";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {deleteArrayElements} from "../common/function/deleteArrayElements";
import {addUniqueArrayElements} from "../common/function/addUniqueArrayElements";
import {deleteNotUniqueArrayElements} from "../common/function/deleteNotUniqueArrayElements";
import {PlayerDto} from "../player/dto/player.dto";
import {AddSearchQuery} from "../common/decorator/request/AddSearchQuery";

@Controller('clan')
export class ClanController{
    public constructor(
        private readonly service: ClanService,
        private readonly requestHelperService: RequestHelperService
    ) {
    }

    @Post()
    @Authorize({action: Action.create, subject: ClanDto})
    @BasicPOST(ClanDto)
    public async create(@Body() body: CreateClanDto, @Req() request: Request) {
        //add clan creator to admins
        const creatorPlayer_id = request['user'].player_id;
        body['admin_ids'] = [creatorPlayer_id];

        const clanResp = await this.service.createOne(body);
        if(!(clanResp instanceof MongooseError))
            await this.requestHelperService.updateOneById(ModelName.PLAYER, creatorPlayer_id, {clan_id: clanResp._id})
        return clanResp;
    }

    @Get('/:_id')
    @Authorize({action: Action.read, subject: ClanDto})
    @BasicGET(ModelName.CLAN, ClanDto)
    @AddGetQueries()
    public get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['populateMongo']);
    }

    @Get()
    @Authorize({action: Action.read, subject: ClanDto})
    @AddSearchQuery(ClanDto)
    @BasicGET(ModelName.CLAN, ClanDto)
    public getAll(@Req() request: Request) {
        return this.service.readAll(request['allowedFields'], request['mongoFilter']);
    }

    @Put()
    @Authorize({action: Action.update, subject: UpdateClanDto})
    @BasicPUT(ModelName.CLAN)
    public async update(@Body() body: UpdateClanDto) {
        if(!body.admin_idsToAdd && !body.admin_idsToDelete)
            return this.service.updateOneById(body);

        const clanToUpdate = await this.service.readOneById(body._id);
        if(!clanToUpdate || clanToUpdate instanceof MongooseError)
            throw new NotFoundException('Clan with that _id not found');

        if(body.admin_idsToDelete)
            clanToUpdate.admin_ids = deleteArrayElements(clanToUpdate.admin_ids, body.admin_idsToDelete);

        body.admin_idsToAdd = deleteNotUniqueArrayElements(body.admin_idsToAdd);
        //add only players that are clan members
        const clanToUpdate_id = clanToUpdate._id.toString();
        const playersInClan: string[] = [];
        const playersNotInClan: string[] = [];
        for(let i=0; i<body.admin_idsToAdd.length; i++){
            const player_id = body.admin_idsToAdd[i];
            const player = await this.requestHelperService.getModelInstanceById(ModelName.PLAYER, player_id, PlayerDto);
            if(player)
                player.clan_id === clanToUpdate_id ? playersInClan.push(player_id) : playersNotInClan.push(player_id);
        }

        const newAdmin_ids = addUniqueArrayElements(clanToUpdate.admin_ids, playersInClan);

        if(newAdmin_ids.length === 0)
            throw new BadRequestException('Clan can not be without at least one admin. You are trying to delete all clan admins');
        body['admin_ids'] = newAdmin_ids;
        const updateResp = await this.service.updateOneById(body);

        if(playersNotInClan.length !== 0)
            throw new BadRequestException(
                `Players with the _ids: [${playersNotInClan.toString()}] ` +
                `can not be added to clan admins because they are not the clan members. ` +
                `All other players are successfully added to clan admins and another clan data are updated as well`
            );

        return updateResp;
    }

    @Delete('/:_id')
    @Authorize({action: Action.delete, subject: UpdateClanDto})
    @BasicDELETE(ModelName.CLAN)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }
}