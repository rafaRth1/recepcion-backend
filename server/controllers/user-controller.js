import { request, response } from 'express';
import generateJWT from '../helpers/generate-jwt.js';
import generateID from '../helpers/generate-id.js';
import User from '../models/User.js';

const registerUser = async (req = Request, res = Response) => {
	const { email } = req.body;
	console.log(email);
	const userExiting = await User.findOne({ email: email });

	if (userExiting) {
		const error = new Error('User already registered');
		return res.status(400).json({ msg: error.message });
	}

	try {
		const user = new User(req.body);
		user.token = generateID();
		await user.save();

		res.json({ msg: 'Usuario creado correctamente, revisa tu email para confirmar' });
	} catch (error) {
		console.log(error);
	}
};

// const getUser = async (req = request, res = response) => {
// 	const
// }

const authenticateUser = async (req = Request, res = Response) => {
	const { email, password } = req.body;

	console.log('req.body', req.body);

	// Comprobar si el usuario existe
	const user = await User.findOne({ email: email });

	if (!user) {
		const error = new Error('User not existent');
		res.status(404).json({ msg: error.message });
	}

	// Comprobar si el usuario esta confirmado

	// if (!user.confirm) {
	// 	const error = new Error('Your account has not been confirmed');
	// 	res.status(403).json({ msg: error.message });
	// }

	// Comprobar su password

	if (await user.checkPassword(password)) {
		res.json({
			_id: user._id,
			nick_name: user.nick_name,
			email: user.email,
			token: generateJWT(user._id),
		});
	} else {
		const error = new Error('Invalid Email or Password');
		res.status(403).json({ msg: error.message });
	}
};

const confirmUser = async (req = request, res = response) => {
	const { token } = req.params;

	const userConfirm = await User.findOne({ token });

	if (!userConfirm) {
		const error = new Error('Invalid token');
		res.status(403).json({ msg: error.message });
	}

	try {
		userConfirm.confirm = true;
		userConfirm.token = '';
		await userConfirm.save();

		res.json({ msg: 'Usuario Confirmador Correctamente' });
	} catch (error) {
		console.log(error);
	}
};

const forgetPassword = async (req = request, res = response) => {
	const { email } = req.body;

	// Comprobar si el usuario existe
	// const user = await User.findOne({ email: email });

	// if (!user) {
	// 	const error = new Error('User not existent');
	// 	res.status(404).json({ msg: error.message });
	// }

	// try {
	// 	user.token = generateID();
	// 	await user.save();

	// 	emailForgetPassword({
	// 		email: user.email,
	// 		name: user.name,
	// 		token: user.token,
	// 	});

	// 	res.json({ msg: 'An email was sent to you with the instructions.' });
	// } catch (error) {
	// 	console.log(error);
	// }
};

const checkToken = async (req = Request, res = Response) => {
	const { token } = req.params;

	const validToken = await User.findOne({ token });

	if (validToken) {
		res.json({ msg: 'Token Valido y el usuario existe' });
	} else {
		const error = new Error('User not existent');
		res.status(404).json({ msg: error.message });
	}
};

const newPassword = async (req = request, res = response) => {
	const { token } = req.params;
	const { password } = req.body;

	const user = await User.findOne({ token });

	if (user) {
		try {
			user.password = password;
			user.token = '';
			await user.save();

			res.json({ msg: 'Password modificado correctamente' });
		} catch (error) {
			console.log(error);
		}

		// return next();
	} else {
		const error = new Error('User not existent');
		res.status(404).json({ msg: error.message });
	}
};

const profileUser = (req = Request, res = Response) => {
	res.json(req.user);
};

export { registerUser, authenticateUser, confirmUser, forgetPassword, profileUser, checkToken, newPassword };
