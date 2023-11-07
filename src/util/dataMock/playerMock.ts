import {PlayerDto} from "../../player/dto/player.dto";

export class PlayerMock {
    public static readonly names: string[] = ['Joseph', 'James', 'Noah', 'William', 'Emma', 'Charlotte', 'Oliver', 'Ava', 'Olivia'];
    public static readonly players: Partial<PlayerDto>[] = [];
    private static nameIndex: number = 0;
    private static collisionIndex: number = 0;

    public static generatePlayer(): Partial<PlayerDto>{
        const name = this.getName();
        const backpackCapacity = PlayerMock.getRandNum();
        const uniqueIdentifier = name.toLowerCase();

        const newPlayer: Partial<PlayerDto> = { name, backpackCapacity, uniqueIdentifier};
        PlayerMock.players.push(newPlayer);

        return newPlayer;
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
    private static getRandNum(min: number=0, max: number=100){
        return Math.floor(Math.random() * (max - min) ) + min;
    }
}