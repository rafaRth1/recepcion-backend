import { Request, Response, NextFunction } from 'express';

interface ValidationError extends Error {
	name: 'ValidationError';
	errors: {
		[key: string]: {
			message: string;
			path: string;
			value: unknown;
		};
	};
}

interface AppError extends Error {
	statusCode?: number;
}

interface ErrorResponse {
	ok: false;
	error: string;
	details?: string[];
}

// Type guard para verificar si es ValidationError
const isValidationError = (err: Error): err is ValidationError => {
	return err.name === 'ValidationError';
};

const errorHandler = (err: AppError | ValidationError, req: Request, res: Response<ErrorResponse>, next: NextFunction): void => {
	// Errores de validación de Mongoose
	if (isValidationError(err)) {
		const errors = Object.values(err.errors).map((e) => e.message);

		res.status(400).json({
			ok: false,
			error: 'Error de validación',
			details: errors,
		});
		return;
	}

	// Otros errores
	const statusCode = err.statusCode || 500;

	res.status(statusCode).json({
		ok: false,
		error: err.message || 'Ocurrió un error en el proceso',
	});
};

export default errorHandler;
