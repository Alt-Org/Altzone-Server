import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {Box, publicReferences} from "./schemas/box.schema";
import BasicService from "../common/service/basicService/BasicService";
import {BoxReference} from "./enum/BoxReference.enum";

@Injectable()
export class BoxService {
    public constructor(
        @InjectModel(Box.name) public readonly model: Model<Box>,
    ){
        this.refsInModel = publicReferences;
        this.basicService = new BasicService(model);
    }

    public readonly refsInModel: BoxReference[];
    private readonly basicService: BasicService;

}
