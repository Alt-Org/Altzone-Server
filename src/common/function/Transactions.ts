import { ClientSession, Connection } from 'mongoose';
import ServiceError from '../service/basicService/ServiceError';
import { IServiceReturn } from '../service/basicService/IService';

/**
 * Initializes and starts a database session for transactions.
 *
 * @param connection - Mongoose database connection.
 *
 * @returns A promise that resolves to the started database session.
 */
export async function InitializeSession(
  connection: Connection,
): Promise<ClientSession> {
  const session = await connection.startSession();
  session.startTransaction();
  return session;
}

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

/**
 * Commits the database transaction and ends the session.
 *
 * @param session - Started database session.
 *
 * @returns A promise that resolves to a successful service return.
 */
export async function endTransaction(
  session: ClientSession,
): Promise<IServiceReturn<any>> {
  await session.commitTransaction();
  await session.endSession();
  return [true, null];
}
