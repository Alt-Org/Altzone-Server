import { isValidObjectId } from "mongoose";

/**
 * Changes the first 3 characters of provided _id to be zeros.
 * If the first 3 characters are already zeros, they will be set to ones.
 * @param existing_id the _id from with generate the non-existing _id
 * 
 * @throws {TypeError} if the existing_id is not a mongo _id
 */
export function getNonExisting_id(existing_id: string) {
    if(!isValidObjectId(existing_id))
        throw new TypeError('Provided string is not a mongo _id');

    const areFirstZeros = existing_id.slice(0, 3) === '000';

    if(areFirstZeros)
        return '111' + existing_id.slice(3);
    
    return '000' + existing_id.slice(3);
}