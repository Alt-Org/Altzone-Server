import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";
import { ExtractField } from 'src/common/decorator/response/ExtractField';
import { ModelName } from 'src/common/enum/modelName.enum';

export type ClanVoteDocument = HydratedDocument<ClanVote>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class ClanVote{

    @Prop({type:String,required:true,unique:false})
    clan_id: string;

    @Prop({type:String,required:true,unique:true})
    itemToBuy_id : string;

    @Prop({type:Number,required:false,unique:false,default:0})
    positiveVotes:number;

    @Prop({type:Number,required:false,unique:false,default:0})
    negativeVotes:number;

    @Prop({type:Array<String>,default: []})
    votedPlayers:String[];
    
    @Prop({type:Number,required:true,unique:false})
    startingTime:number;

    @Prop({type:Number,required:true,unique:false})
    votingTime:number;
    
    @ExtractField()
    _id: string;
}
export const ClanVoteSchema = SchemaFactory.createForClass(ClanVote);
ClanVoteSchema.set('collection', ModelName.CLANVOTE);
