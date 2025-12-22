import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import Ticket from '../models/Ticket';
import { EditTicketBody, EditTicketParams, TicketDocument, TicketResponse } from '../interfaces/ticket';
import { DeliveryStatus, TicketStatus } from 'interfaces/shared/interfaces';
import { CreateTicketRequest, UpdateTicketRequest } from 'schemas/ticket';

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

const getTicketById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		if (!validateObjectId(id)) {
			return next(createError('ID de ticket inválido', 400));
		}

		const ticket: TicketDocument | null = await Ticket.findById(id).select('-__v');

		if (!ticket) {
			return next(createError('Ticket no encontrado', 404));
		}

		res.success({ ticket }, 200);
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

const editTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;
		const body = req.body as UpdateTicketRequest;

		if (!validateObjectId(id)) {
			return next(createError('ID de ticket inválido', 400));
		}

		if (Object.keys(body).length === 0) {
			return next(createError('No se proporcionaron datos para actualizar', 400));
		}

		const ticket: TicketDocument | null = await Ticket.findById(id);

		if (!ticket) {
			return next(createError('Ticket no encontrado', 404));
		}

		// Actualizar campos proporcionados
		if (body.nameTicket !== undefined) ticket.nameTicket = body.nameTicket;
		if (body.type !== undefined) ticket.type = body.type;
		if (body.dishes !== undefined) {
			ticket.dishes = body.dishes.map((dish) => ({
				dishFood: dish.dishFood,
				price: dish.price,
				rice: dish.rice ?? false,
				salad: dish.salad ?? false,
			}));
		}
		if (body.drinks !== undefined) {
			ticket.drinks = body.drinks.map((drink) => ({
				name: drink.name,
				price: drink.price,
			}));
		}
		if (body.creams !== undefined) ticket.creams = body.creams;
		if (body.exception !== undefined) ticket.exception = body.exception;
		if (body.paymentType !== undefined) ticket.paymentType = body.paymentType;
		if (body.color !== undefined) ticket.color = body.color;
		if (body.status !== undefined) ticket.status = body.status;
		if (body.deliveryStatus !== undefined) ticket.deliveryStatus = body.deliveryStatus;

		// Recalcular totalPrice si se actualizaron dishes o drinks
		if (body.dishes !== undefined || body.drinks !== undefined) {
			const dishesTotal = ticket.dishes.reduce((sum, dish) => sum + dish.price, 0);
			const drinksTotal = ticket.drinks?.reduce((sum, drink) => sum + drink.price, 0) || 0;
			ticket.totalPrice = dishesTotal + drinksTotal;
		}

		await ticket.save();
		res.success({ ticket }, 200);
	} catch (error) {
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

export { addTicket, getTickets, getTicketsUser, editTicket, deleteTicket, getTicketsDelivery, getTicketById };
