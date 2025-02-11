import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import {BoxService} from "./box.service";

@Controller('box')
export class BoxController {
    public constructor(
        private readonly service: BoxService,
    ) {
    }


}