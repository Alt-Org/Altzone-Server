import { ClientSession } from "mongoose";
import ServiceError from "../service/basicService/ServiceError";

	/**
	 * Aborts the database transaction and ends the session.
	 *
	 * @param session - Started database session.
	 * @param error - The error to be thrown.
	 * 
	 * @throws Will throw an unexpected service error.
	 */
	export async function  cancelTransaction(
		session: ClientSession,
		error: ServiceError[]
	) {
		await session.abortTransaction();
		await session.endSession();
		throw error;
	}