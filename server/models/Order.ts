import { OrderDocument } from '../interfaces/order/index.js';
import { Schema, model } from 'mongoose';
import Ticket from './Ticket.js';

const OrderSchema = new Schema<OrderDocument>(
	{
		table: [Ticket],
		delivery: [Ticket],
		pick: [Ticket],
	},
	{
		timestamps: true,
	}
);

const OrderModel = model<OrderDocument>('Order', OrderSchema);

export default OrderModel;
