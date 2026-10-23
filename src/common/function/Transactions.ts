import { ClientSession, Connection } from 'mongoose';
import ServiceError from '../service/basicService/ServiceError';
import { IServiceReturn } from '../service/basicService/IService';
import { Logger } from '@nestjs/common';
import TransactionCommitError from './TransactionCommitError';
import { SEReason } from '../service/basicService/SEReason';

const logger = new Logger();

/**
 * Initializes and starts a database session for transactions.
 *
 * @param connection - Mongoose database connection.
 * @returns A promise that resolves to the started database session.
 */
export async function initializeSession(
  connection: Connection,
): Promise<IServiceReturn<ClientSession>> {
  let session: ClientSession | null = null;

  try {
    session = await connection.startSession();
    session.startTransaction();
    return [session, null];
  } catch (startError) {
    logger.error('Failed to start Mongo transaction', startError);
    if (session) await session.endSession();

    return [
      null,
      [
        new ServiceError({
          reason: SEReason.UNEXPECTED,
          field: 'session',
          value: startError,
          message: 'Failed to start Mongo transaction',
        }),
      ],
    ];
  }
}

/**
 * Aborts the database transaction and ends the session.
 *
 * @param session - Started database session.
 * @param errors - The error to be returned.
 * @returns A promise that returns an unexpected service error.
 */
export async function cancelTransaction<T>(
  session: ClientSession,
  errors: ServiceError | ServiceError[],
): Promise<IServiceReturn<T>> {
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

  return [null, errorsArray];
}

/**
 * Commits the database transaction and ends the session.
 *
 * @param session - Started database session.
 * @param value - (Optional) Value to return upon successful transaction completion.
 * @returns A promise that resolves to a successful service return.
 */
export async function endTransaction<T = true>(
  session: ClientSession,
  value?: T,
): Promise<IServiceReturn<T>> {
  const result = value ?? (true as T);
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
