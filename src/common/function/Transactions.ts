import { ClientSession } from 'mongoose';
import ServiceError from '../service/basicService/ServiceError';
import { IServiceReturn } from '../service/basicService/IService';

/**
 * Aborts the database transaction and ends the session.
 *
 * @param session - Started database session.
 * @param error - The error to be thrown.
 *
 * @throws Will throw an unexpected service error.
 */
export async function cancelTransaction(
  session: ClientSession,
  error: ServiceError[],
): Promise<IServiceReturn<any>> {
  await session.abortTransaction();
  await session.endSession();
  return [null, error];
}
