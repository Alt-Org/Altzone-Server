import {PlayerDto} from "../../player/dto/player.dto";
import {CommonMocker, GetWrongFieldDTOptions} from "./commonMocker";
import {ModelName} from "../../common/enum/modelName.enum";

export class PlayerMocker {
    public static readonly names: string[] = ['Joseph', 'James', 'Noah', 'William', 'Emma', 'Charlotte', 'Oliver', 'Ava', 'Olivia'];
    public static players: Partial<PlayerDto>[] = [];
    private static nameIndex: number = 0;
    private static collisionIndex: number = 0;

    public static getValid(): Partial<PlayerDto>{
        const name = this.getName();
        const backpackCapacity = CommonMocker.getRandNum();
        const uniqueIdentifier = name.toLowerCase();

        const newObj: Partial<PlayerDto> = {name, backpackCapacity, uniqueIdentifier};
        PlayerMocker.players.push(newObj);

        return newObj;
    }

    public static getWithoutFields(fieldsToEscape: string[]): Partial<PlayerDto> {
        const validObj = this.getValid() as PlayerDto;
        return CommonMocker.removeObjectFields<PlayerDto>(validObj, fieldsToEscape);
    }
    public static getWrongDT(fieldsToBeWrong?: string[], options?: GetWrongFieldDTOptions): {}{
        const validObj = this.getValid();
        return CommonMocker.generateObjWithWrongDT(validObj, fieldsToBeWrong, options);
    }

    public static getObjMeta(){
        return CommonMocker.getMetadataForObject('Player', ModelName.PLAYER);
    }
    public static getArrMeta(count: number){
        return CommonMocker.getMetadataForArray('Player', ModelName.PLAYER, count);
    }

    private static getName(){
        if(this.nameIndex >= this.names.length){
            this.nameIndex = 0;
            this.collisionIndex++;
        }
        
        const result = PlayerMocker.names[this.nameIndex] + this.collisionIndex;
        this.nameIndex++;
        return result;
    }
}