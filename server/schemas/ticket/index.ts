// src/schemas/ticket.schema.ts
import { PaymentType, TicketType, TicketStatus, DeliveryStatus } from 'interfaces/shared/interfaces';
import { z } from 'zod';

const dishSchema = z.object({
	dishFood: z.string().min(1, 'El nombre del plato es requerido'),
	price: z.number().positive('El precio debe ser mayor a 0'),
	rice: z.boolean().optional().default(false),
	salad: z.boolean().optional().default(false),
});

const drinkSchema = z.object({
	name: z.string().min(1, 'El nombre de la bebida es requerido'),
	price: z.number().positive('El precio debe ser mayor a 0'),
});

const creamSchema = z.object({
	creams: z.array(z.string()),
});

export const createTicketSchema = z.object({
	nameTicket: z.string('El nombre ticket es requerido').min(1, 'El nombre del ticket es requerido'),
	type: z.enum(
		[TicketType.TABLE, TicketType.DELIVERY, TicketType.PICKUP],
		'El tipo de pedido es requerido "MESA"|"DELIVERY"|"RECOJO"'
	),
	dishes: z.array(dishSchema).min(1, 'Debe haber al menos un plato'),
	drinks: z.array(drinkSchema).optional().default([]),
	creams: z.array(creamSchema).optional().default([]),
	exception: z.string().optional(),
	// paymentType: z.enum([PaymentType.YAPE, PaymentType.PLIN, PaymentType.EFECTIVO]).optional(),
	color: z.string().optional(),
});

// Schema para ACTUALIZAR ticket - Todos los campos son opcionales
export const updateTicketSchema = z.object({
	nameTicket: z.string().min(1, 'El nombre del ticket es requerido').optional(),
	type: z
		.enum([TicketType.TABLE, TicketType.DELIVERY, TicketType.PICKUP], 'El tipo de pedido debe ser "TABLE"|"DELIVERY"|"PICKUP"')
		.optional(),
	dishes: z.array(dishSchema).min(1, 'Debe haber al menos un plato').optional(),
	drinks: z.array(drinkSchema).optional(),
	creams: z.array(creamSchema).optional(),
	exception: z.string().optional(),
	paymentType: z
		.enum([PaymentType.YAPE, PaymentType.PLIN, PaymentType.EFECTIVO], 'El tipo de pago debe ser "YAPE"|"PLIN"|"EFECTIVO"')
		.optional(),
	color: z.string().optional(),
	status: z
		.enum(
			[TicketStatus.PROCESS, TicketStatus.COMPLETED, TicketStatus.CANCELLED],
			'El estado debe ser "PROCESS"|"COMPLETED"|"CANCELLED"'
		)
		.optional(),
	deliveryStatus: z
		.enum(
			[DeliveryStatus.PROCESS, DeliveryStatus.COMPLETED, DeliveryStatus.CANCELLED],
			'El estado de delivery debe ser "PROCESS"|"COMPLETED"|"CANCELLED"'
		)
		.optional(),
});

export type CreateTicketRequest = z.infer<typeof createTicketSchema>;
export type UpdateTicketRequest = z.infer<typeof updateTicketSchema>;
