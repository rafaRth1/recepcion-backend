import { DeliveryStatus, PaymentType, TicketStatus, TicketType } from 'interfaces/shared/interfaces';
import { Document, Types } from 'mongoose';

export interface Ticket {
	nameTicket: string;
	dishes: Dish[];
	creams: Cream[];
	drinks: Drink[];
	color?: string;
	totalPrice: number;
	exception?: string;
	paymentType?: PaymentType;
	status: TicketStatus;
	deliveryStatus: DeliveryStatus;
	momentaryTime: string;
	type: TicketType;
	user: Types.ObjectId;
}

interface Dish {
	key: string;
	dishFood: string;
	price: number;
	rice: boolean;
	salad: boolean;
}

interface Cream {
	creams: string[];
}

interface Drink {
	key: string;
	name: string;
	price: number;
}

export interface EditTicketParams {
	id: string;
}

export interface EditTicketBody {
	status?: TicketStatus;
	deliveryStatus?: DeliveryStatus;
	color?: string;
}

export interface TicketResponse {
	msg: string;
}

export interface TicketDocument extends Ticket, Document {
	createdAt: Date;
	updatedAt: Date;
}
