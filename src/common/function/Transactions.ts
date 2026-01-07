import { ClientSession, Connection } from 'mongoose';
import ServiceError from '../service/basicService/ServiceError';
import { IServiceReturn } from '../service/basicService/IService';
import { Logger } from '@nestjs/common';
import TransactionCommitError from './TransactionCommitError';

const logger = new Logger();

/**
 * Initializes and starts a database session for transactions.
 *
 * @param connection - Mongoose database connection.
 *
 * @param openedSession - (Optional) An already opened ClientSession to use.
 *
 * @returns A promise that resolves to the started database session.
 */
export async function initializeSession(
  connection: Connection,
  openedSession?: ClientSession,
): Promise<ClientSession> {
  if (openedSession) return openedSession;

  const session = await connection.startSession();
  session.startTransaction();
  return session;
}

/**
 * Aborts the database transaction and ends the session.
 *
 * @param session - Started database session.
 * @param errors - The error to be returned.
 * @returns A promise that returns an unexpected service error.
 */
export async function cancelTransaction(
  session: ClientSession,
  errors: ServiceError | ServiceError[],
): Promise<IServiceReturn<never>> {
  const errorsArray = Array.isArray(errors) ? errors : [errors];

  try {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
  } catch (abortError) {
    logger.error('Failed to abort transaction', abortError);
  } finally {
    try {
      await session.endSession();
    } catch (endError) {
      logger.error('Failed to end transaction', endError);
    }
  }

  return [null as never, errorsArray];
}

/**
 * Commits the database transaction and ends the session.
 *
 * @param session - Started database session.
 * @param returnValue - (Optional) Value to return upon successful transaction completion.
 * @returns A promise that resolves to a successful service return.
 */
export async function endTransaction(
  session: ClientSession,
  value?: ClientSession,
): Promise<IServiceReturn<true>>;
export async function endTransaction<T>(
  session: ClientSession,
  value?: T,
): Promise<IServiceReturn<T>>;
export async function endTransaction<T = true>(
  session: ClientSession,
  value?: T,
): Promise<IServiceReturn<T | true>> {
  const result = typeof value === 'undefined' ? (true as const) : value;

  let commitError: unknown;

  try {
    await session.commitTransaction();
  } catch (err) {
    commitError = err;
  } finally {
    try {
      await session.endSession();
    } catch (endError) {
      logger.error('Failed to end session', endError);
    }
  }

  if (commitError) {
    logger.error('Commit failed', commitError);
    return [null, [new TransactionCommitError(commitError)]];
  }

  return [result, null];
}
