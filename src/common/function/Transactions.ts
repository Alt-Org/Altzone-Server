import { ClientSession, Connection } from 'mongoose';
import ServiceError from '../service/basicService/ServiceError';
import { IServiceReturn } from '../service/basicService/IService';

/**
 * Initializes and starts a database session for transactions.
 *
 * @param connection - Mongoose database connection.
 *
 * @param openSession - (Optional) An already opened ClientSession to use.
 *
 * @returns A promise that resolves to the started database session.
 */
export async function InitializeSession(
  connection: Connection,
  openSession?: ClientSession,
): Promise<ClientSession> {
  if (openSession) return openSession;

  const session = await connection.startSession();
  session.startTransaction();
  return session;
}

/**
 * Aborts the database transaction and ends the session.
 *
 * @param session - Started database session.
 * @param error - The error to be thrown.
 * @param openSession - (Optional) An already opened ClientSession to use.
 * @throws Will throw an unexpected service error.
 */
export async function cancelTransaction(
  session: ClientSession,
  error: ServiceError[],
  openSession?: ClientSession,
): Promise<IServiceReturn<any>> {
  if (openSession) return [null, error];
  await session.abortTransaction();
  await session.endSession();
  return [null, error];
}

/**
 * Commits the database transaction and ends the session.
 *
 * @param session - Started database session.
 * @param returnValue - (Optional) Value to return upon successful transaction completion.
 * @param openSession - (Optional) An already opened ClientSession to use.
 * @returns A promise that resolves to a successful service return.
 */
export async function endTransaction(
  session: ClientSession,
  openSession?: ClientSession,
): Promise<IServiceReturn<true>>;
export async function endTransaction<T>(
  session: ClientSession,
  returnValue: T,
): Promise<IServiceReturn<T>>;
export async function endTransaction<T = true>(
  session: ClientSession,
  returnValue?: T,
  openSession?: ClientSession,
): Promise<IServiceReturn<T | true>> {
  const result: T | true =
    typeof returnValue === 'undefined' ? (true as const) : returnValue;

  if (openSession) {
    return [result, null];
  }
  await session.commitTransaction();
  await session.endSession();

  return [result, null];
}
