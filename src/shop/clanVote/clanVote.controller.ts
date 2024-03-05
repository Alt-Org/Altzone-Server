import { Body, Controller, Delete, Get, Param, Post, Put, Req } from "@nestjs/common";
import { ClanVoteService } from "./clanVote.service";
import { RequestHelperService } from "src/requestHelper/requestHelper.service";
import { BasicPOST } from "src/common/base/decorator/BasicPOST.decorator";
import { CreateClanDto } from "src/clan/dto/createClan.dto";
import { BasicGET } from "src/common/base/decorator/BasicGET.decorator";
import { AddGetQueries } from "src/common/decorator/request/AddGetQueries.decorator";
import { _idDto } from "src/common/dto/_id.dto";
import { ModelName } from "src/common/enum/modelName.enum";
import { ClanVoteDto } from "./dto/clanVote.dto";
import { OffsetPaginate } from "src/common/interceptor/request/offsetPagination.interceptor";
import { AddSearchQuery } from "src/common/interceptor/request/addSearchQuery.interceptor";
import { AddSortQuery } from "src/common/interceptor/request/addSortQuery.interceptor";
import { GetAllQuery } from "src/common/decorator/param/GetAllQuery";
import { query } from "express";
import { IGetAllQuery } from "src/common/interface/IGetAllQuery";
import { BasicPUT } from "src/common/base/decorator/BasicPUT.decorator";
import { modelNames } from "mongoose";
import { UpdateRoomDto } from "src/Room/dto/updateRoom.dto";
import { BasicDELETE } from "src/common/base/decorator/BasicDELETE.decorator";
import { CreateClanVoteDto } from "./dto/createClanVote.dto";
import { UpdateClanDto } from "src/clan/dto/updateClan.dto";
import { updateClanVoteDto } from "./dto/updateClanVote.dto";

@Controller('ClanVote')
export class ClanVoteController {
    public constructor(
        private readonly service: ClanVoteService,
        private readonly requestHelperService: RequestHelperService
    ) {
    }


    //TODO Add authorization after functional

    @Post()
    @BasicPOST(CreateClanVoteDto)
    public async create(@Body() body : CreateClanVoteDto, @Req() request: Request) {
        return this.service.createOne(body);
    }

    @Get("/:_id")
    @BasicGET(ModelName.CLANVOTE,ClanVoteDto)
    @AddGetQueries()
    public async get(@Param() param: _idDto, @Req() request: Request) {
        return this.service.readOneById(param._id, request['mongoPopulate']);
    }

    @Get()
    @OffsetPaginate(ModelName.CLANVOTE)
    @AddSearchQuery(ClanVoteDto)
    @AddSortQuery(ClanVoteDto)
    @BasicGET(ModelName.CLANVOTE,ClanVoteDto)
    public async getAll(@GetAllQuery() query : IGetAllQuery) {
        return this.service.readAll(query);
    }

    @Put()
    @BasicPUT(ModelName.CLANVOTE)
    public async update(@Body() body:updateClanVoteDto) {
       return this.service.handleUpdate(body);
    }

    @Delete("/:_id")
    @BasicDELETE(ModelName.CLANVOTE)
    public delete(@Param() param: _idDto) {
        return this.service.deleteOneById(param._id);
    }


}