import { Schema, model } from 'mongoose';
import Ticket from './Ticket';

export const OrderSchema = new Schema(
	{
		table: [Ticket],
		delivery: [Ticket],
		pick: [Ticket],
	},
	{
		timestamps: true,
	}
);

const Order = model('Order', OrderSchema);

export default Order;
