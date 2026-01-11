import express from 'express';
import { addTicket, completeTicket, deleteTicket, editTicket, getTicketById, getTickets } from '../controllers/ticket-controller';
import { validate } from 'middleware/validate';
import { createTicketSchema, updateTicketSchema } from 'schemas/ticket';
import checkAuth from 'middleware/check-auth';

const router = express.Router();

// GET /api/ticket - Obtener todos los tickets
router.get('/', checkAuth, getTickets);

// GET /api/ticket/:id - Obtener UN ticket específico por ID
router.get('/:id', checkAuth, getTicketById);

// POST /api/ticket - Crear un nuevo ticket
router.post('/', checkAuth, validate(createTicketSchema), addTicket);

// PUT /api/ticket/:id - Actualizar ticket de una tienda
router.put('/:id', checkAuth, validate(updateTicketSchema), editTicket);

// DELETE /api/ticket/:id - Eliminar ticket de una tienda
router.delete('/:id', checkAuth, deleteTicket);

// PATCH /api/ticket/:id/complete - Completar ticket
router.patch('/:id/complete', checkAuth, completeTicket);

export default router;
