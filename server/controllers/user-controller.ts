import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import generateJWT from '../helpers/generate-jwt';
import generateID from '../helpers/generate-id';
import {
	AuthenticateBody,
	AuthenticatedRequest,
	AuthResponse,
	MessageResponse,
	NewPasswordBody,
	RegisterBody,
	TokenParams,
	UserDocument,
} from '../interfaces/user';

const registerUser = async (
	req: Request<{}, MessageResponse, RegisterBody>,
	res: Response<MessageResponse>,
	next: NextFunction
): Promise<void> => {
	const { email } = req.body;

	try {
		const userExisting = await User.findOne({ email });

		if (userExisting) {
			res.status(400).json({ msg: 'Usuario ya registrado' });
			return;
		}

		const user = new User(req.body);
		user.token = generateID();
		await user.save();

		res.status(200).json({ msg: 'Usuario creado correctamente, revisa tu email para confirmar' });
	} catch (error) {
		next(error);
	}
};

const authenticateUser = async (
	req: Request<{}, AuthResponse | MessageResponse, AuthenticateBody>,
	res: Response<AuthResponse | MessageResponse>,
	next: NextFunction
): Promise<void> => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) {
			res.status(404).json({ msg: 'Usuario no existe' });
			return;
		}

		const isValidPassword = await user.checkPassword(password);

		if (isValidPassword) {
			res.json({
				_id: user._id.toString(),
				nickName: user.nickName,
				email: user.email,
				token: generateJWT(user._id.toString()),
			});
		} else {
			res.status(403).json({ msg: 'Email o contraseña inválidos' });
		}
	} catch (error) {
		next(error);
	}
};

const confirmUser = async (
	req: Request<TokenParams, MessageResponse>,
	res: Response<MessageResponse>,
	next: NextFunction
): Promise<void> => {
	const { token } = req.params;

	try {
		const user = await User.findOne({ token });

		if (!user) {
			res.status(403).json({ msg: 'Token inválido' });
			return;
		}

		user.token = '';
		await user.save();

		res.json({ msg: 'Usuario confirmado correctamente' });
	} catch (error) {
		next(error);
	}
};

const forgetPassword = async (
	req: Request<{}, MessageResponse, { email: string }>,
	res: Response<MessageResponse>,
	next: NextFunction
): Promise<void> => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) {
			res.status(404).json({ msg: 'Usuario no existe' });
			return;
		}

		user.token = generateID();
		await user.save();

		// TODO: Implementar envío de email
		// emailForgetPassword({
		//   email: user.email,
		//   name: user.nick_name,
		//   token: user.token,
		// });

		res.json({ msg: 'Se envió un email con las instrucciones' });
	} catch (error) {
		next(error);
	}
};

const checkToken = async (
	req: Request<TokenParams, MessageResponse>,
	res: Response<MessageResponse>,
	next: NextFunction
): Promise<void> => {
	const { token } = req.params;

	try {
		const user = await User.findOne({ token });

		if (user) {
			res.json({ msg: 'Token válido y el usuario existe' });
		} else {
			res.status(404).json({ msg: 'Token inválido' });
		}
	} catch (error) {
		next(error);
	}
};

const newPassword = async (
	req: Request<TokenParams, MessageResponse, NewPasswordBody>,
	res: Response<MessageResponse>,
	next: NextFunction
): Promise<void> => {
	const { token } = req.params;
	const { password } = req.body;

	try {
		const user = await User.findOne({ token });

		if (!user) {
			res.status(404).json({ msg: 'Usuario no existe' });
			return;
		}

		user.password = password;
		user.token = '';
		await user.save();

		res.json({ msg: 'Contraseña modificada correctamente' });
	} catch (error) {
		next(error);
	}
};

const profileUser = (req: Request, res: Response<UserDocument | MessageResponse>): void => {
	if (!req.user) {
		res.status(401).json({ msg: 'Usuario no autenticado' });
		return;
	}

	res.json(req.user);
};

export { registerUser, authenticateUser, confirmUser, forgetPassword, profileUser, checkToken, newPassword };
