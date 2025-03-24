import ICounter from './ICounter';
import { Model } from 'mongoose';

/**
 * @property model - where the field is located
 * @property counterField - counter field name
 */
type CounterSettings = {
  /**
   * where the field is located
   */
  model: Model<any>;
  /**
   * counter field name
   */
  counterField: string;
};

/**
 * Class used for managing counter fields of collections in DB.
 *
 * Notice that these fields must be integers.
 */
export default class Counter implements ICounter {
  constructor({ model, counterField }: CounterSettings) {
    this.model = model;
    this.counterField = counterField;
  }

  public async decrease(filter: object, amount: number) {
    return changeCounterValue(
      this.model,
      filter,
      this.counterField,
      -Math.abs(amount),
    );
  }
  public async decreaseById(_id: string, amount: number) {
    return changeCounterValue(
      this.model,
      { _id },
      this.counterField,
      -Math.abs(amount),
    );
  }

  public async decreaseOnOne(filter: object) {
    return changeCounterValue(this.model, filter, this.counterField, -1);
  }
  public async decreaseByIdOnOne(_id: string) {
    return changeCounterValue(this.model, { _id }, this.counterField, -1);
  }

  public async increase(filter: object, amount: number) {
    return changeCounterValue(
      this.model,
      filter,
      this.counterField,
      Math.abs(amount),
    );
  }
  public async increaseById(_id: string, amount: number) {
    return changeCounterValue(
      this.model,
      { _id },
      this.counterField,
      Math.abs(amount),
    );
  }

  public async increaseOnOne(filter: object) {
    return changeCounterValue(this.model, filter, this.counterField, 1);
  }
  public async increaseByIdOnOne(_id: string) {
    return changeCounterValue(this.model, { _id }, this.counterField, 1);
  }

  private readonly model: Model<any>;
  private readonly counterField: string;
}

/**
 * Changes a counter field in DB
 *
 * @param model where the field is located
 * @param filter how the field can be found
 * @param counterField counter field name
 * @param counterChange how the counter field must be changed. It can be negative or positive number
 * @returns
 * _true_ if the change succeeded
 *
 * _false_ if the change did not succeed
 */
async function changeCounterValue(
  model: Model<any>,
  filter: object,
  counterField: string,
  counterChange: number,
): Promise<boolean> {
  const docToUpdate = await model.findOne(filter);
  if (!docToUpdate) return false;

  const currentCount = docToUpdate[counterField];
  if (currentCount == null) return false;

  const newCount = currentCount + counterChange;
  if (newCount < 0) return false;

  const updateResponse = await model.updateOne(
    { _id: docToUpdate._id },
    { [counterField]: newCount },
  );
  const isCountModified = updateResponse.modifiedCount !== 0;
  return isCountModified;
}
