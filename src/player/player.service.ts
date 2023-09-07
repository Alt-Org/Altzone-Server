import {BadRequestException, Injectable} from "@nestjs/common";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Player} from "./player.schema";
import {RequestHelperService} from "../requestHelper/requestHelper.service";
import {IBasicService} from "../common/base/interface/IBasicService";
import {IgnoreReferencesType} from "../common/type/ignoreReferences.type";
import {ModelName} from "../common/enum/modelName.enum";
import {CustomCharacterService} from "../customCharacter/customCharacter.service";
import {RaidRoomService} from "../raidRoom/raidRoom.service";
import {BasicServiceDummyAbstract} from "../common/base/abstract/basicServiceDummy.abstract";
import {AddBasicService} from "../common/base/decorator/AddBasicService.decorator";
import {ClanDto} from "../clan/dto/clan.dto";
import {IClass} from "../common/interface/IClass";
import {instanceToPlain} from "class-transformer";
import {PlayerDto} from "./dto/player.dto";

const dbToQuery: Record<string, string> = {
    '$eq' : '=' ,
    '$gt' : '>' ,
    '$gte' : '>=' ,
    '$lt' : '<' ,
    '$lte' : '<='
}
const queryToDB: Record<string, string> = {
    '=' : '$eq',
    '>' : '$gt',
    '>=' : '$gte',
    '<' : '$lt',
    '<=' : '$lte'
}
const querySelectors: string[] = Object.values(dbToQuery);
type operator = 'AND' | 'OR';
const operators: Record<operator, string> = {
    OR: 'OR',
    AND: 'AND'
}

interface FlatQuery {
    field: string;
    selector: string;
    value: string | number;
}

@Injectable()
@AddBasicService()
export class PlayerService extends BasicServiceDummyAbstract implements IBasicService{
    public constructor(
        @InjectModel(Player.name) public readonly model: Model<Player>,
        private readonly customCharacterService: CustomCharacterService,
        private readonly raidRoomService: RaidRoomService,
        private readonly requestHelperService: RequestHelperService
    ){
        super();
        this.refsInModel = [ModelName.CLAN, ModelName.CUSTOM_CHARACTER, ModelName.RAID_ROOM];
    }

    public readonly refsInModel: ModelName[];

    //TODO: test and refactor query logic
    public search = async (query: string, dtoClass: IClass) => {
        //name="lol";AND;age>=18;
        if(query.charAt(query.length-1) === ';')
            query = query.substring(0, query.length-1);

        const searchParts = query.split(';');
        //Should be odd count, if not it is something like: name="lol";AND
        if(searchParts.length % 2 === 0)
            return null;

        //Get fields that can be queried
        const dtoClassInstance = new dtoClass();
        const possibleFields = Object.getOwnPropertyNames(instanceToPlain(dtoClassInstance));

        const andGroups: string[][] = [];
        //split query by ORs
        let andGroupStart = 0;
        for(let i=0; i<searchParts.length; i++){
            if(searchParts[i] === operators.OR){
                andGroups.push(searchParts.slice(andGroupStart, i));
                andGroupStart = i+1;
            }
        }
        //add last and group
        andGroups.push(searchParts.slice(andGroupStart));

        //Generate { $and: [] } mongo queries
        const andQueries: Object[] = [];
        for(let i=0; i<andGroups.length; i++){
            const group = andGroups[i];
            let andQuery = { $and: [] };
            for(let i=0; i<group.length; i+=2){
                const query = this.unpackSearchPair(group[i], possibleFields);
                if(!query)
                    break;
                andQuery.$and.push({[query.field]: {[query.selector]: query.value}});
            }
            if(andQuery.$and.length !== 0)
                andQueries.push(andQuery);
        }

        if(andQueries.length === 0)
            return null;

        let mongoQuery = andQueries.length === 1 ? andQueries[0] : { $or: andQueries };

        return await this.requestHelperService.getModelInstanceByCondition(ModelName.PLAYER, mongoQuery, PlayerDto);
    }

    private unpackSearchPair = (searchPair: string, allowedFields: string[]): FlatQuery | null => {
        //Find splitter = operator like >,<, = etc.
        const pairChars = [...searchPair];
        let splitter: string;
        for(let i=0; i<pairChars.length; i++){
            const char = pairChars[i];
            if(querySelectors.includes(char)){
                splitter = char;
                if((char === '<' || char === '>') && pairChars[i+1] === '=')
                    splitter += '=';
                break;
            }
        }

        const splitPair = searchPair.split(splitter);
        //if no key-value pair or search field is not allowed
        if(splitPair.length !== 2 || !allowedFields.includes(splitPair[0]))
            return null;

        const [field, value] = splitPair;
        const isValueString = value.includes('"');
        //if the condition for a string field is not equals('=')
        if(isValueString && splitter !== '=')
            return null;

        let selector = queryToDB[splitter];
        if(!selector)
            return null;
        const parsedValue = isValueString ? value.substring(1, value.length-1) : Number(value);
        if(!parsedValue)
            return null;

        if(typeof parsedValue === 'string' && parsedValue.includes('.'))
            selector = '$regex';

        return {
            field: field,
            selector: selector,
            value: parsedValue
        }
    }

    public clearCollectionReferences = async (_id: Types.ObjectId, ignoreReferences?: IgnoreReferencesType): Promise<void> => {
        const isClanRefCleanSuccess = await this.clearClanReferences(_id.toString());
        if(isClanRefCleanSuccess instanceof Error)
            throw new BadRequestException(isClanRefCleanSuccess.message);
        await this.customCharacterService.deleteByCondition({player_id: _id});
        await this.raidRoomService.deleteByCondition({player_id: _id}, {isOne: true});
    }

    private clearClanReferences = async (_id: string): Promise<boolean | Error> => {
        const clansWithPlayerAsAdmin = await this.requestHelperService.getModelInstanceByCondition(
            ModelName.CLAN,
            {admin_ids: {$in: [_id]}},
            ClanDto
        );

        if(clansWithPlayerAsAdmin && clansWithPlayerAsAdmin.length > 0){
            //Check that there will be no clans left without admins
            let isLastAdmin = false;
            let clan_idLastAdmin: string;
            for(let i=0; i<clansWithPlayerAsAdmin.length; i++){
                const currentClan = clansWithPlayerAsAdmin[i];
                if(currentClan.admin_ids.length === 1){
                    isLastAdmin = true;
                    clan_idLastAdmin = currentClan._id;
                    break;
                }
            }

            if(isLastAdmin){
                return new Error(
                    `Player can not be deleted, because it is the only one admin in clan with _id '${clan_idLastAdmin}'. ` +
                    `Please add another admin to this clan before deleting this Player or delete this clan first.`
                );
            }

            for(let i=0; i<clansWithPlayerAsAdmin.length; i++){
                const currentClan = clansWithPlayerAsAdmin[i];
                const newAdmin_ids = currentClan.admin_ids.filter(value => value !== _id);
                await this.requestHelperService.updateOneById(ModelName.CLAN, currentClan._id, {admin_ids: newAdmin_ids})
            }

            return true;
        }
    }
}