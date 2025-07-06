import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class UniqueFieldGenerator {
  /**
   * Checks that each element in the provided array has a unique value in the DB.
   * If the value for provided field already exists an amount number will be added to the end of the value in order to make it unique.
   *
   * @param model model where the values should be unique
   * @param field unique field name
   * @param value of the unique fields
   * @private
   *
   * @returns an array, where each value is a unique in DB.
   */
  public async generateUniqueFieldValue(
    model: Model<any>,
    field: string,
    value: string,
  ): Promise<string> {
    const existingValues = await this.getExistingUniqueValue(
      model,
      field,
      value,
    );

    let uniqueValue = value;

    if (existingValues[value] !== undefined) {
      let highestNumber = existingValues[value];
      highestNumber++;
      uniqueValue = `${value}-${highestNumber}`;
    }

    while (await model.exists({ [field]: uniqueValue })) {
      existingValues[value]++;
      uniqueValue = `${value}-${existingValues[value]}`;
    }

    return uniqueValue;
  }

  /**
   * Searches for the amount of items in the DB, which field starts with the values.
   * If the value for provided field exists it will be added to the returned record.
   * For example if there are an items which start with "john" and "john-1", it will return that there are 2 values like this.
   *
   * @param model model where search for the values
   * @param field field name
   * @param value value to search
   * @private
   *
   * @returns an record containing values which were found in DB.
   */
  private async getExistingUniqueValue(
    model: Model<any>,
    field: string,
    value: string,
  ): Promise<Record<string, number>> {
    const existingItems = await model
      .find({
        [field]: { $regex: new RegExp(`^(${value})(-\\d+)?$`, 'i') },
      })
      .select(field)
      .lean();

    const valuesCounts: Record<string, number> = {};

    existingItems.forEach((item) => {
      const match = item[field].match(/^(.*?)(-(\d+))?$/);
      if (match) {
        const base = match[1];
        const number = match[3] ? parseInt(match[3], 10) : 0;

        if (!valuesCounts[base] || number > valuesCounts[base]) {
          valuesCounts[base] = number;
        }
      }
    });

    return valuesCounts;
  }
}
