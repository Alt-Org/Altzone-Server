import {PlayerDto} from "../../player/dto/player.dto";
import { IDataMocker } from "./IDataMocker";
import { CommonMocker } from "./commonMocker";

//TODO: add interface(IDataMocker) for static class or change it to singleton
export class PlayerMock{
    public static readonly names: string[] = ['Joseph', 'James', 'Noah', 'William', 'Emma', 'Charlotte', 'Oliver', 'Ava', 'Olivia'];
    public static readonly players: Partial<PlayerDto>[] = [];
    private static nameIndex: number = 0;
    private static collisionIndex: number = 0;

    public static getValid(): Partial<PlayerDto>{
        const name = this.getName();
        const backpackCapacity = CommonMocker.getRandNum();
        const uniqueIdentifier = name.toLowerCase();

        const newPlayer: Partial<PlayerDto> = { name, backpackCapacity, uniqueIdentifier};
        PlayerMock.players.push(newPlayer);

        return newPlayer;
    }

    public static getWithoutFields(fieldsToEscape: string[]): Partial<PlayerDto> {
        const player = this.getValid() as PlayerDto;
        return CommonMocker.removeObjectFields<PlayerDto>(player, fieldsToEscape);
    }
    public static getWrongDT(fieldsToBeWrong?: string[]): {}{
        let player = this.getValid();
        return CommonMocker.generateObjWithWrongDT(player, fieldsToBeWrong);
    }

    public static getObjMeta(){
        return CommonMocker.getMetadataForObject('Player', 'Player');
    }
    public static getArrMeta(count: number){
        return CommonMocker.getMetadataForArray('Player', 'Player', count);
    }

    private static getName(){
        if(this.nameIndex >= this.names.length){
            this.nameIndex = 0;
            this.collisionIndex++;
        }
        
        const result = PlayerMock.names[this.nameIndex] + this.collisionIndex;
        this.nameIndex++;
        return result;
    }
}