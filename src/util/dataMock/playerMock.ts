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

    public static generatePlayerWithoutFields(fieldsToEscape: string[]): Partial<PlayerDto> {
        const player = this.generatePlayer();
        let result = {};
        for(let field in player){
            if(!fieldsToEscape.includes(field)){
                result[field] = player[field];
            }
        }

        return result;
    }

    public static generatePlayerWithWrongDataTypes(fieldsToBeWrong: string[]): any {

    }

    private static getWrongFieldDataType(fieldValue: any): any{
        const dataTypesForBoolean = ['number', 'string'];
        const dataTypesForNumber = ['boolean', 'string'];
        const dataTypesForString = ['boolean', 'number'];

        if(typeof fieldValue === 'boolean'){
            const type = this.chooseRandArrElem(dataTypesForBoolean);
            if(type === 'number')
                return this.getRandNum();
            else if(type === 'string')
                return this.getRandString();
        }else if(typeof fieldValue === 'number'){
            const type = this.chooseRandArrElem(dataTypesForNumber);
            if(type === 'number')
                return this.getRandNum();
            else if(type === 'string')
                return this.getRandString();
        }

        if(typeof fieldValue === 'boolean'){
            const type = this.chooseRandArrElem(dataTypesForBoolean);
            if(type === 'number')
                return this.getRandNum();
            else if(type === 'string')
                return this.getRandString();
        }
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
    private static getRandBoolean(): boolean{
        const values = [true, false];
        return this.chooseRandArrElem(values);
    }
    private static getRandNum(min: number=0, max: number=100): number{
        return Math.floor(Math.random() * (max - min)) + min;
    }
    private static getRandString(): string{
        const values = ['randomString', 'anotherString', 'helloWorld', 'testing'];
        return this.chooseRandArrElem(values) + this.getRandNum(0,1000);
    }

    private static chooseRandArrElem(arr: any[]){
        const randIndex = this.getRandNum(0,arr.length-1);
        return arr[randIndex];
    }
}