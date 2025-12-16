import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodType<any, any>) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			req.body = schema.parse(req.body);
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const firstError = error.issues[0];

				return res.status(400).json({
					ok: false,
					message: firstError.message,
				});
			}
			next(error);
		}
	};
};
