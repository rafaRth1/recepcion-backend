import { Request, Response, NextFunction } from 'express';

// Interface para la respuesta exitosa
interface SuccessResponse<T = unknown> {
	ok: true;
	message: string;
	data: T;
}

// Extender Response para incluir el método success
declare global {
	namespace Express {
		interface Response {
			success: <T>(data?: T, status?: number) => void;
		}
	}
}

const responseHandler = (req: Request, res: Response, next: NextFunction): void => {
	res.success = <T>(data: T = {} as T, status: number = 200): void => {
		res.status(status).json({
			ok: true,
			message: 'Operación exitosa',
			data,
		} as SuccessResponse<T>);
	};

	next();
};

export default responseHandler;
