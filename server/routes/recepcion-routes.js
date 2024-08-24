import express from 'express';
import { addTicket, deleteTicket, editTicket, getTickets, getTicketsUser } from '../controllers/recepcion-controller.js';

const router = express.Router();

router.route('/').post(addTicket).get(getTickets);
router.route('/:id').get(getTicketsUser).put(editTicket).delete(deleteTicket);

export default router;
