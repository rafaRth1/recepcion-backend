import mongoose, { Schema, model } from 'mongoose';

export const TicketSchema = new Schema(
	{
		name_ticket: {
			type: String,
			required: true,
			trim: true,
		},
		dishes: [
			{
				key: String,
				dish_food: String,
				price: Number,
				rice: Boolean,
				salad: Boolean,
			},
		],
		creams: [{ creams: [String] }],
		drinks: [
			{
				key: String,
				name: String,
				price: Number,
			},
		],
		color: String,
		total_price: Number,
		exception: String,
		time: String,
		type_payment: String,
		status: {
			type: String,
			enum: ['completed', 'process'],
			required: true,
		},
		status_delivery: {
			type: String,
			enum: ['completed', 'process'],
			required: true,
		},
		type: {
			type: String,
			enum: ['table', 'delivery', 'pickup'],
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
);

const Ticket = model('Ticket', TicketSchema);

export default Ticket;
