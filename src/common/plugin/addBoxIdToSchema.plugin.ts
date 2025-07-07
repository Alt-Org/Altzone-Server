import { Schema } from 'mongoose';

/**
 * Adds box_id field to a DB schema
 *
 * @param schema where box_id field to add
 */
export function addBoxIdToSchemaPlugin(schema: Schema) {
  schema.add({
    box_id: {
      type: String,
      required: false,
      default: null,
    },
  });

  schema.index({ box_id: 1 });
}
