import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UserDocument } from '../interfaces/user';

// Interface para el payload del JWT
interface JwtPayload {
	id: string;
	iat: number;
	exp: number;
}

// Extender Request para incluir user
declare global {
	namespace Express {
		interface Request {
			user?: UserDocument;
		}
	}
}

const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const authorization = req.headers.authorization;

	if (!authorization || !authorization.startsWith('Bearer')) {
		res.status(401).json({ msg: 'Token no proporcionado' });
		return;
	}

	const token = authorization.split(' ')[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

		const user = await User.findById(decoded.id).select('-password -token -createdAt -updatedAt -__v');

		if (!user) {
			res.status(401).json({ msg: 'Usuario no encontrado' });
			return;
		}

		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({ msg: 'Token inválido o expirado' });
	}
};

export default checkAuth;
