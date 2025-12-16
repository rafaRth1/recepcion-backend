import { UserDocument } from '../interfaces/user';
import { Response } from 'express';

declare module 'express-serve-static-core' {
	interface Request {
		user?: UserDocument;
	}

	interface Response {
		success: <T>(data?: T, status?: number) => Response;
	}
}
