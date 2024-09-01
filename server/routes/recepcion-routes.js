import express from 'express';
import {
	addTicket,
	deleteTicket,
	editTicket,
	getTickets,
	getTicketsDelivery,
	getTicketsUser,
} from '../controllers/recepcion-controller.js';

const router = express.Router();

router.route('/').post(addTicket).get(getTickets);
router.route('/store/:id').get(getTicketsUser).put(editTicket).delete(deleteTicket);

// Routes page delivery
router.route('/delivery').get(getTicketsDelivery);

export default router;
