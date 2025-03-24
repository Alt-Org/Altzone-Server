import {PlayerDto} from "../../player/dto/player.dto";
import {CommonMocker, GetWrongFieldDTOptions} from "./commonMocker";
import {ModelName} from "../../common/enum/modelName.enum";

export class PlayerMocker {
    public readonly names: string[] = ['Joseph', 'James', 'Noah', 'William', 'Emma', 'Charlotte', 'Oliver', 'Ava', 'Olivia'];
    public players: Partial<PlayerDto>[] = [];
    private nameIndex: number = 0;
    private collisionIndex: number = 0;
    private commonMocker = new CommonMocker();

    public getValid(): Partial<PlayerDto>{
        const name = this.getName();
        const backpackCapacity = this.commonMocker.getRandNum();
        const uniqueIdentifier = name.toLowerCase();

        const newObj: Partial<PlayerDto> = {name, backpackCapacity, uniqueIdentifier};
        this.players.push(newObj);

        return newObj;
    }

    public getWithoutFields(fieldsToEscape: string[]): Partial<PlayerDto> {
        const validObj = this.getValid() as PlayerDto;
        return this.commonMocker.removeObjectFields<PlayerDto>(validObj, fieldsToEscape);
    }
    public getWrongDT(fieldsToBeWrong?: string[], options?: GetWrongFieldDTOptions): unknown[] {
        const validObj = this.getValid();
        const resp = this.commonMocker.generateWrongDataTypesResponse(validObj, fieldsToBeWrong);
        const req = this.commonMocker.generateObjWithWrongDT(validObj, fieldsToBeWrong, options);
        return [req, resp];
    }

    public getNotUnique(existingObj: object, notUniqueField: 'name' | 'uniqueIdentifier'): object[]{
        const req = this.getValid();
        req['profile_id'] = existingObj['profile_id'];
        req[notUniqueField] = existingObj[notUniqueField];
        const resp = this.commonMocker.generateNotUniqueFieldsResponse({[notUniqueField]: existingObj[notUniqueField]});
        return [req, resp];
    }

    public getObjMeta(){
        return this.commonMocker.getMetadataForObject('Player', ModelName.PLAYER);
    }
    public getArrMeta(count: number){
        return this.commonMocker.getMetadataForArray('Player', ModelName.PLAYER, count);
    }

    private getName(){
        if(this.nameIndex >= this.names.length){
            this.nameIndex = 0;
            this.collisionIndex++;
        }
        
        const result = this.names[this.nameIndex] + this.collisionIndex;
        this.nameIndex++;
        return result;
    }
}