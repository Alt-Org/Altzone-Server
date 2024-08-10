/**
 * Provides functionality of increasing or decreasing counter fields in DB
 */
export default interface ICounter{
    /**
     * Decrease the counter field by the specified amount.
     *
     * Notice that since the counter field can not go below zero, 
     * the method will set zero as a value in case the amount to decrease is more than the counter field value
     * @param filter filter for finding the document in DB
     * @param amount amount to decrease
     * @returns _true_ if the counter field was decreased successfully, also if the amount to decrease was more than the counter field.
     * 
     * _false_ if the counter could not be decreased 
     */
    decrease: (filter: object, amount: number) => Promise<boolean>;
    /**
     * Decrease the counter field by the specified amount.
     *
     * Notice that since the counter field can not go below zero, 
     * the method will set zero as a value in case the amount to decrease is more than the counter field value 
     * @param _id Mongo _id of the document
     * @param amount amount to decrease
     * @returns _true_ if the counter field was decreased successfully, also if the amount to decrease was more than the counter field.
     * 
     * _false_ if the counter could not be decreased 
     */
    decreaseById: (_id: string, amount: number) => Promise<boolean>;
    
    /**
     * Decrease the counter field by one.
     *
     * Notice that since the counter field can not go below zero, 
     * the method will set zero as a value in case the counter field value is already zero.
     * @param filter filter for finding the document in DB
     * @returns _true_ if the counter field was decreased successfully, also if the counter field was already zero
     * 
     * _false_ if the counter could not be decreased 
     */
    decreaseOnOne: (filter: object) => Promise<boolean>;
    /**
     * Decrease the counter field by one.
     *
     * Notice that since the counter field can not go below zero, 
     * the method will set zero as a value in case the counter field value is already zero.
     * @param _id Mongo _id of the document
     * @param filter filter for finding the document in DB
     * @returns _true_ if the counter field was decreased successfully, also if the counter field was already zero
     * 
     * _false_ if the counter could not be decreased 
     */
    decreaseByIdOnOne: (_id: string) => Promise<boolean>;


    /**
     * Increase the counter field by the specified amount.
     * @param filter filter for finding the document in DB
     * @param amount amount to increase
     * @returns _true_ if the counter field was increased successfully
     * 
     * _false_ if the counter could not be increased 
     */
    increase: (filter: object, amount: number) => Promise<boolean>;
    /**
     * Increase the counter field by the specified amount.
     * @param _id Mongo _id of the document
     * @param amount amount to increase
     * @returns _true_ if the counter field was increased successfully
     * 
     * _false_ if the counter could not be increased 
     */
    increaseById: (_id: string, amount: number) => Promise<boolean>;

    /**
     * Increase the counter field by one.
     * @param filter filter for finding the document in DB
     * @returns _true_ if the counter field was increased successfully
     * 
     * _false_ if the counter could not be increased 
     */
    increaseOnOne: (filter: object) => Promise<boolean>;
    /**
     * Increase the counter field by one.
     * @param _id Mongo _id of the document
     * @returns _true_ if the counter field was increased successfully
     * 
     * _false_ if the counter could not be increased 
     */
    increaseByIdOnOne: (_id: string) => Promise<boolean>;
}