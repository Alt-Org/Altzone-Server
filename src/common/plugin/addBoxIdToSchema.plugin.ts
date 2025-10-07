import { Schema } from 'mongoose';
import { ModelName } from '../enum/modelName.enum';

/**
 * Adds box_id field to a DB schema
 *
 * @param schema where box_id field to add
 */
export function addBoxIdToSchemaPlugin(schema: Schema) {
  const collection = schema.get('collection');
  //TODO: Delete v2box later
  if (
    collection === ModelName.TEACHER_PROFILE ||
    collection === ModelName.BOX ||
    collection === 'v2Box' ||
    !collection
  )
    return;

  schema.add({
    box_id: {
      type: String,
      required: false,
      default: null,
    },
  });

  schema.index({ box_id: 1 });
}
