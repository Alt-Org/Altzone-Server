import { times } from "lodash";
import { Timestamp } from "mongodb";


export function getTimeSince(timeStamp: number) {
    let date = Date.now();
    return  date - timeStamp;

}
export function passed(timeStamp:number,ms : number) {
    let date = Date.now();
    return date - timeStamp >= ms;
}