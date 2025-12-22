import { Schema, model } from 'mongoose';
import { TicketDocument } from '../interfaces/ticket';
import { DeliveryStatus, PaymentType, TicketStatus, TicketType } from 'interfaces/shared/interfaces';

const TicketSchema = new Schema<TicketDocument>(
	{
		nameTicket: {
			type: String,
			required: true,
			trim: true,
		},
		dishes: [
			{
				dishFood: String,
				price: Number,
				rice: Boolean,
				salad: Boolean,
			},
		],
		creams: [{ creams: [String] }],
		drinks: [
			{
				name: String,
				price: Number,
			},
		],
		color: String,
		totalPrice: Number,
		exception: String,
		momentaryTime: {
			type: String,
			required: false,
		},
		paymentType: {
			type: String,
			enum: Object.values(PaymentType),
			required: false,
		},
		status: {
			type: String,
			enum: Object.values(TicketStatus),
			required: true,
		},
		deliveryStatus: {
			type: String,
			enum: Object.values(DeliveryStatus),
			required: true,
		},
		type: {
			type: String,
			enum: Object.values(TicketType),
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'El usuario es requerido'],
		},
	},
	{
		timestamps: true,
	}
);

const TicketModel = model<TicketDocument>('Ticket', TicketSchema);

export default TicketModel;
