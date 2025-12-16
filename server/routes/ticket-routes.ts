import express from 'express';
import {
	addTicket,
	deleteTicket,
	editTicket,
	getTickets,
	getTicketsDelivery,
	getTicketsUser,
} from '../controllers/ticket-controller';
import { validate } from 'middleware/validate';
import { createTicketSchema } from 'schemas/ticket';
import checkAuth from 'middleware/check-auth';

const router = express.Router();

// GET /api/ticket - Obtener todos los tickets
router.get('/', checkAuth, getTickets);

// POST /api/ticket - Crear un nuevo ticket
router.post('/', checkAuth, validate(createTicketSchema), addTicket);

// PUT /api/ticket/:id - Actualizar ticket de una tienda
router.put('/:id', checkAuth, editTicket);

// DELETE /api/ticket/:id - Eliminar ticket de una tienda
router.delete('/:id', checkAuth, deleteTicket);

// GET /api/ticket/store/:id - Obtener tickets de una tienda específica
router.get('/store/:id', getTicketsUser);

// GET /api/ticket/delivery - Obtener tickets de delivery
router.get('/delivery', getTicketsDelivery);

export default router;
