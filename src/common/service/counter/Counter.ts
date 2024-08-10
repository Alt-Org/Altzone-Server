import ICounter from "./ICounter";
import { Model } from "mongoose";

type CounterSettings = {
    model: Model<any>,
    counterField: string
}

export default class Counter implements ICounter{
    constructor({model, counterField}: CounterSettings){
        this.model = model;
        this.counterField = counterField;
    }

    public async decrease(filter: object, amount: number) {
        return changeCounterValue(this.model, filter, this.counterField, -Math.abs(amount));
    }
    public async decreaseById(_id: string, amount: number) {
        return changeCounterValue(this.model, {_id}, this.counterField, -Math.abs(amount));
    }

    public async decreaseOnOne(filter: object) {
        return changeCounterValue(this.model, filter, this.counterField, -1);
    }
    public async decreaseByIdOnOne(_id: string) {
        return changeCounterValue(this.model, {_id}, this.counterField, -1);
    }


    public async increase(filter: object, amount: number) {
        return changeCounterValue(this.model, filter, this.counterField, Math.abs(amount));
    }
    public async increaseById(_id: string, amount: number) {
        return changeCounterValue(this.model, {_id}, this.counterField, Math.abs(amount));
    }

    public async increaseOnOne(filter: object) {
        return changeCounterValue(this.model, filter, this.counterField, 1);
    }
    public async increaseByIdOnOne(_id: string) {
        return changeCounterValue(this.model, {_id}, this.counterField, 1);
    }

    private readonly model: Model<any>;
    private readonly counterField: string;
}

async function changeCounterValue(model: Model<any>, filter: object, counterField: string, counterChange: number): Promise<boolean>{
    const docToUpdate = await model.findOne(filter);
    if(!docToUpdate)
        return false;

    const currentCount = docToUpdate[counterField];
    if(currentCount == null)
        return false;

    const newCount = currentCount + counterChange;
    if(newCount < 0)
        return false;

    const updateResponse = await model.updateOne({_id: docToUpdate._id}, {[counterField]: newCount});
    const isCountModified = updateResponse.modifiedCount !== 0;
    return isCountModified;
}