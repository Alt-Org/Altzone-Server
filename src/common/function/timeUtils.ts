import { times } from "lodash";
import { Timestamp } from "mongodb";
let date = Date.now();

export function getTimeSince(timeStamp: number) {
    return  date - timeStamp;

}
export function passed(timeStamp:number,ms : number) {
    return date - timeStamp >= ms;
}