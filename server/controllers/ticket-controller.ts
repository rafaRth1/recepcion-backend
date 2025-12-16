import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import Ticket from '../models/Ticket';
import { EditTicketBody, EditTicketParams, TicketDocument, TicketResponse } from '../interfaces/ticket';
import { DeliveryStatus, TicketStatus } from 'interfaces/shared/interfaces';
import { CreateTicketRequest } from 'schemas/ticket';

interface AppError extends Error {
	statusCode?: number;
}

const createError = (message: string, statusCode: number): AppError => {
	const error: AppError = new Error(message);
	error.statusCode = statusCode;
	return error;
};

const validateObjectId = (id: string): boolean => {
	return mongoose.Types.ObjectId.isValid(id);
};

const getTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const tickets = await Ticket.find({ status: TicketStatus.PROCESS }).select('-__v');
		res.success(tickets, 200);
	} catch (error) {
		next(error);
	}
};

const getTicketsUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		if (!validateObjectId(id)) {
			return next(createError('ID de usuario inválido', 400));
		}

		const tickets = await Ticket.find({ user: id }).select('-createdAt -updatedAt -__v');
		res.success({ tickets }, 200);
	} catch (error) {
		next(error);
	}
};

const getTicketsDelivery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const tickets = await Ticket.find({ status_delivery: 'process', type: 'delivery' }).select('-createdAt -updatedAt -__v');
		res.success({ tickets }, 200);
	} catch (error) {
		next(error);
	}
};

const addTicket = async (req: Request<{}, {}, CreateTicketRequest>, res: Response, next: NextFunction): Promise<void> => {
	try {
		const ticketData = req.body;

		const dishesTotal = ticketData.dishes.reduce((sum, dish) => sum + dish.price, 0);
		const drinksTotal = ticketData.drinks?.reduce((sum, drink) => sum + drink.price, 0) || 0;
		const totalPrice = dishesTotal + drinksTotal;

		const newTicket = await Ticket.create({
			nameTicket: ticketData.nameTicket,
			dishes: ticketData.dishes,
			drinks: ticketData.drinks || [],
			creams: ticketData.creams || [],
			exception: ticketData.exception,
			paymentType: ticketData.paymentType,
			color: ticketData.color,
			type: ticketData.type,
			status: TicketStatus.PROCESS,
			user: req.user?._id,
			deliveryStatus: DeliveryStatus.PROCESS,
			totalPrice,
		});

		res.success(newTicket, 201);
	} catch (error) {
		next(error);
	}
};

const editTicket = async (
	req: Request<EditTicketParams, TicketResponse, EditTicketBody>,
	res: Response<TicketResponse>,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = req.params;

		if (!validateObjectId(id)) {
			return next(createError('ID de ticket inválido', 400));
		}

		// Verificar que el body no esté vacío
		if (Object.keys(req.body).length === 0) {
			return next(createError('No se proporcionaron datos para actualizar', 400));
		}

		const ticket: TicketDocument | null = await Ticket.findById(id);

		if (!ticket) {
			return next(createError('Ticket no encontrado', 404));
		}

		// Actualizar solo los campos proporcionados
		if (req.body.status !== undefined) ticket.status = req.body.status;
		if (req.body.deliveryStatus !== undefined) ticket.deliveryStatus = req.body.deliveryStatus;
		if (req.body.color !== undefined) ticket.color = req.body.color;

		await ticket.save();
		res.success({ ticket }, 200);
	} catch (error) {
		// Manejo de errores de validación de Mongoose
		if (error instanceof mongoose.Error.ValidationError) {
			const messages = Object.values(error.errors).map((err) => err.message);
			return next(createError(messages.join(', '), 400));
		}

		next(error);
	}
};

const deleteTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		if (!validateObjectId(id)) {
			return next(createError('ID de ticket inválido', 400));
		}

		const result = await Ticket.deleteOne({ _id: id });

		if (result.deletedCount === 0) {
			return next(createError('Ticket no encontrado', 404));
		}

		res.success({ message: 'Ticket eliminado correctamente' }, 200);
	} catch (error) {
		next(error);
	}
};

export { addTicket, getTickets, getTicketsUser, editTicket, deleteTicket, getTicketsDelivery };
