import express from 'express';
import {
	registerUser,
	authenticateUser,
	confirmUser,
	forgetPassword,
	profileUser,
	checkToken,
	newPassword,
} from '../controllers/user-controller';
import checkAuth from '../middleware/check-auth';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', authenticateUser);
router.get('/confirm/:token', confirmUser);
router.post('/forget-password', forgetPassword);
router.route('/forget-password/:token').get(checkToken).post(newPassword);
router.get('/perfil', checkAuth, profileUser);

export default router;
