import { TicketDocument } from '../ticket';

export interface Order {
	table: TicketDocument[];
	delivery: TicketDocument[];
	pick: TicketDocument[];
}

export interface OrderDocument extends Order, Document {
	createdAt: Date;
	updatedAt: Date;
}
